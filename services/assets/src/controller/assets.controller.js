import mongoose from "mongoose";
import assetsRepository from "../respositories/assetsRepository.js";
import {
  UploadFile,
  DeleteFile,
  GetFile,
  getUrlToFile,
} from "../helper/s3Client.js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { uploadMediaToCloudinary } from "../helper/cloudinary.js";
import categoryRepository from "../respositories/categoryRepository.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const addAsset = async (req, res, next) => {
  try {
    const reqData = req.body;
    const document = req.file;
    const { isTemplateUpload } = req.query;
    const categoryId = reqData.category;

    if (!document) {
      return res.status(400).json({
        success: false,
        message: "Please upload a document. It is required.",
      });
    }

    if (categoryId) {
      const [errors,category] = await categoryRepository.findOneById(categoryId, {});
      if (!category) {
        return res.status(404).json({
          status: "fail",
          statusCode: 404,
          data: {},
          message: "Category is not found"
        });
      }
    }

    const fileName = `${Date.now()}-${document.originalname}`;
    let uploadResult;

    if (isTemplateUpload === "true") {
      console.log("yes");
      uploadResult = await uploadMediaToCloudinary(document);
      console.log("Uploaded to Cloudinary:", uploadResult.secure_url);
    } else {
      uploadResult = await UploadFile(fileName, document.buffer, "assets");
      console.log("Uploaded to Server:", uploadResult.url);
    }

    if (!uploadResult || uploadResult.success === false) {
      return res.status(500).json({
        success: false,
        message: "File upload failed.",
      });
    }

    const data = {
      ...reqData,
      url: uploadResult.secure_url || uploadResult.url,
      uploadedBy: req.user.userId,
    };

    const [errors, result] = await assetsRepository.insertOne(data);
    if (errors) {
      console.error(errors);
      return res.status(500).json({
        status: "fail",
        statusCode: 500,
        message: "Something went wrong while saving asset data.",
      });
    }

    if (categoryId) {
      const [errors2, result2] = await categoryRepository.addAsset(categoryId, result?._id);
      if (errors2) {
        console.log(errors2);
        return res.status(500).json({
          status: "fail",
          statusCode: 500,
          message: "Something went wrong while saving category data.",
        });
      }
    }

    return res.status(201).json({
      status: "success",
      statusCode: 201,
      message: "Asset added successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "fail",
      statusCode: 500,
      message: "Something went wrong.",
    });
  }
};

const fetchAsset = async (req, res, next) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      search,
      menuName,
      id,
    } = req.query;

    let assetData = {};

    let accessPermission = { read: false, write: false, both: false };

    req?.user?.rolePermissions?.menu?.map((p) => {
      if (p?.menuName?.toLowerCase() == "assets") {
        accessPermission = {
          both: p?.both,
          read: p?.read,
          write: p?.write,
        };
      }
    });

    if (id && mongoose.isValidObjectId(id)) {
      const [error, result] = await assetsRepository.findById(id);
      if (!result) {
        return res.status(404).json({
          status: "fail",
          statusCode: 404,
          message: "Asset not found",
          data: {},
        });
      }

      assetData = result;
    } else {
      const options = {
        page: parseInt(page) || 1,
        pageSize: parseInt(pageSize) || 10,
        sort: sortBy ? { [sortBy]: -1 } : null,
        sortOrder,
        search,
        menuName,
      };

      console.log(options);

      const [ error, data ] = await assetsRepository.getManyWithPagination(
        {},
        options
      );

      assetData = {
        assets: data,
        accessPermission: accessPermission,
      };
    }

    res.status(200).json({
      status: "success",
      statusCode: 200,
      message: "Successfully fetch assets",
      data: assetData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "fail",
      statusCode: 500,
      message: "Something went wrong.",
      data: {},
    });
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await assetsRepository.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { status: status }
    );

    res.status(200).json({
      status: "success",
      statusCode: 200,
      message: "Status updated successfully",
      data: {},
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "fail",
      statusCode: 500,
      message: "Something went wrong.",
      data: {},
    });
  }
};

const updateAsset = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const categoryId = data?.category;

    const document = req.file;

    const [err, assets] = await assetsRepository.findOne({
      _id: new mongoose.Types.ObjectId(id),
    });

    if (!assets) {
      return res.status(404).json({
        status: "fail",
        statusCode: 404,
        message: "Asset not found",
        data: {},
      });
    }

    if (categoryId) {
      const [errors,category] = await categoryRepository.findOneById(categoryId, {});
      if (!category) {
        return res.status(404).json({
          status: "fail",
          statusCode: 404,
          data: {},
          message: "Category is not found"
        });
      }
    }

    const oldUrl = assets?.url;
    let assetUrl = assets?.url;
    if (document) {
      const fileName = `${Date.now()}-${document?.originalname}`;

      const documentData = await UploadFile(
        fileName,
        document?.buffer,
        "assets"
      );

      if (!documentData?.success) {
        return res.status(500).json({
          status: "fail",
          statusCode: 500,
          message: "Some thing want wrong",
          data: {},
        });
      }

      assetUrl = documentData?.url;
    }

    await assetsRepository.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      {
        ...data,
        url: assetUrl,
      }
    );

    if (document) {
      await DeleteFile(oldUrl?.split(".com/")?.[1]);
    }

    if (assets?.category?._id) {
      await categoryRepository.removeAssets(assets?.category?._id, id);
    }

    if (categoryId) {
      await categoryRepository.addAsset(categoryId, id);
    }

    res.status(200).json({
      status: "success",
      statusCode: 200,
      message: "Asset update successfully",
      data: {},
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "fail",
      statusCode: 500,
      message: "Something went wrong.",
      data: {},
    });
  }
};

const deleteAssets = async (req, res, next) => {
  try {
    const { id } = req?.params;

    const [err, assets] = await assetsRepository.findById(id);

    if (!assets) {
      return res.status(404).json({
        status: "fail",
        statusCode: 404,
        message: "Assets not found",
        data: {},
      });
    }

    await DeleteFile(assets?.url?.split(".com/")?.[1]);

    await assetsRepository.deleteOne({ _id: new mongoose.Types.ObjectId(id) });

    if (assets?.category) {
      await categoryRepository.removeAssets(assets?.category?._id, id);
    }

    return res.status(200).json({
      status: "success",
      statusCode: 200,
      message: "assets deleted successfully",
      data: {},
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "fail",
      statusCode: 500,
      message: "Something went wrong.",
      data: {},
    });
  }
};

const cloneAssets = async (req, res, next) => {
  try {
    const { assetId } = req.body;

    const [err, assetData] = await assetsRepository.findById(assetId);

    if (!assetData) {
      return res.status(404).json({
        status: "fail",
        statusCode: 404,
        message: "Asset not found.",
        data: {},
      });
    }

    let { _id, ...reqData } = assetData;

    const assetFileName = assetData?.url?.split("assets/")?.[1];

    const originalFileName = assetFileName?.replace(
      `${assetFileName?.split("-")?.[0]}-`,
      ""
    );

    const fileName = `${Date.now()}-${originalFileName}`;

    // const fileBuffer = readFileSync(join(__dirname, '..', 'uploads', 'assets', assetFileName));

    const fileBuffer = await getUrlToFile(assetData?.url);

    // const fileBuffer = readFileSync(assetData?.url);

    const documentData = await UploadFile(fileName, fileBuffer, "assets");

    if (!documentData?.success) {
      return res.status(500).json({
        success: false,
        message: "Something want wrong",
      });
    }

    const data = {
      ...reqData,
      url: documentData.url,
      status: "Pending",
      uploadedBy: req.user.userId,
    };

    console.log(data);

    const [errors, result] = await assetsRepository.insertOne(data);

    if (errors) {
      console.log(errors);
      return res.status(500).json({
        status: "fail",
        statusCode: 500,
        message: "Something went wrong",
        data: {},
      });
    }

    if (assetData?.category?._id) {
      await categoryRepository.addAsset(assetData?.category?._id, result?._id);
    }

    return res.status(201).json({
      status: "success",
      statusCode: 201,
      message: "Asset has been cloned successfully.",
      data: {
        cloneId: result?._id,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "fail",
      statusCode: 500,
      message: "Something went wrong.",
      data: {},
    });
  }
};

export {
  addAsset,
  fetchAsset,
  updateAsset,
  updateStatus,
  deleteAssets,
  cloneAssets,
};
