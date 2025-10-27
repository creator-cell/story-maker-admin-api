import notificationRepository from "../respositories/notificationRepository.js";
import userRepository from "../respositories/userRepository.js";
import {
  sendMailNotification,
  sendSmsNotification,
} from "../helper/sendNotification.js";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { renderFile } from "ejs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const handleSendMails = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { message } = req.body;

    const [err, data] = await userRepository.findMany({
      email: { $ne: "" },
      isActive: true,
    });

    let emails =
      data?.length > 0
        ? data
            ?.filter((p) => {
              if (p?.role?.name?.toLowerCase() == "user") {
                return p;
              }
            })
            ?.map((p) => {
              return p?.email;
            })
        : [];

    if (emails.length <= 0) {
      return res.status(404).json({
        status: "fail",
        statusCode: 404,
        message: "Users not found",
        data: {},
      });
    }

    emails = [...new Set(emails)];

    const filePath = join(__dirname, "..", "templates", "notification.ejs");

    const htmlTemplate = await renderFile(filePath, {
      message: message,
      copyrightYear: new Date().getFullYear(),
    });

    const result = await sendMailNotification(
      emails,
      "🔔 Notification from Story-Maker",
      htmlTemplate
    );

    await notificationRepository.insertOne({
      type: "mail",
      message: message,
      deliverCount: emails.length || 0,
      sendedBy: userId,
    });

    console.log("Result :");
    console.log(result);

    return res.status(200).json({
      status: "success",
      statusCode: 200,
      message: "Notification sended successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "fail",
      statusCode: 500,
      message: "Something want wrong",
      data: {},
    });
  }
};

const handleSendSms = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { message } = req.body;

    const [err, data] = await userRepository.findMany({
      phone: { $ne: "" },
      isActive: true,
    });

    if (err) console.log(err);

    let numbers =
      data?.length > 0
        ? data
            ?.filter((p) => {
              if (p?.role?.name?.toLowerCase() == "user") {
                return p;
              }
            })
            ?.map((p) => {
              return `${p?.phone}`;
            })
        : [];

    numbers = [...new Set(numbers)];

    if (numbers.length <= 0) {
      return res.status(404).json({
        status: "fail",
        statusCode: 404,
        message: "Users not found",
        data: {},
      });
    }

    const result = await sendSmsNotification(numbers, message);

    await notificationRepository.insertOne({
      type: "sms",
      message: message,
      deliverCount: numbers?.length || 0,
      sendedBy: userId,
    });

    return res.status(200).json({
      status: "success",
      statusCode: 200,
      message: "Sms send successfully",
      data: {},
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "fail",
      statusCoded: 500,
      message: "Something went wrong",
      data: {},
    });
  }
};

const getNotification = async (req, res, next) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const filters = {};

    let baseFilter = {};

    const { error, data } = await notificationRepository.getManyWithPagination(
      baseFilter,
      {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        search,
        filters,
        sort,
      }
    );

    if (error) {
      return res
        .status(500)
        .json({ message: "Error fetching notification history", error: error });
    }

    return res.status(200).json({
      status: "success",
      statusCode: 200,
      message: "Successfully get notification history",
      data: data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "fail",
      statusCode: 500,
      message: "Something went wrong",
      data: {},
    });
  }
};

export { handleSendMails, handleSendSms, getNotification };
