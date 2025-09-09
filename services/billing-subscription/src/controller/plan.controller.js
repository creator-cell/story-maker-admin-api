import mongoose from "mongoose";
import planRepository from "../respositories/planRepository.js";

const addPlan = async (req, res, next) => {
    try {
        const reqData = req.body;

        const data = {
            ...reqData,
            uploadedBy: req.user.userId
        };

        const [errors, result] = await planRepository.insertOne(data);
        if (errors) {
            console.log(errors);
            return res.status(500).json({
                status: "fail",
                statusCode: 500,
                message: "Something went wrong",
                data: {}
            });
        }

        return res.status(201).json({
            status: "success",
            statusCode: 201,
            message: "Plan have been added successfully."
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: "fail",
            statusCode: 500,
            message: "Something went wrong.",
            data: {}
        });
    }
}

const getPlan = async (req, res, next) => {
    try {
        const { page, pageSize, sortBy = 'createdAt', sortOrder = 'desc', search, menuName, id } = req.query;

        let planData = {};

        let accessPermission = { read: false, write: false, both: false};

        req?.user?.rolePermissions?.menu?.map(p => {
            if (p?.menuName?.toLowerCase() == "plans") {
                accessPermission = {
                    both: p?.both,
                    read: p?.read,
                    write: p?.write
                }
            }
        });

        if (id && mongoose.isValidObjectId(id)) {
            const [error, result] = await planRepository.findOneById(id);
            if (!result) {
                return res.status(404).json({
                    status: "fail",
                    statusCode: 404,
                    message: "Plan not found",
                    data: {}
                });
            }

            planData = result;
            
        } else {

            const options = {
                page: parseInt(page) || 1,
                pageSize: parseInt(pageSize) || 10,
                sortBy,
                sortOrder,
                search,
                menuName
            };

            const {error, data} = await planRepository.getManyWithPagination({}, options);
            
            planData = {
                plan: data,
                accessPermission: accessPermission
            };
        }

        res.status(200).json({
            status: "success",
            statusCode: 200,
            message: "Successfully fetch plans",
            data: planData
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: "fail",
            statusCode: 500,
            message: "Something went wrong.",
            data: {}
        });
    }
}

const updatePlan = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const [err, assets] = await planRepository.findOne({_id : new mongoose.Types.ObjectId(id)});
        
        if (!assets) {
            return res.status(404).json({
                status: "fail",
                statusCode: 404,
                message: "Plan not found",
                data: {}
            });
        }

        
        await planRepository.updateOne({_id: new mongoose.Types.ObjectId(id)}, data);

        res.status(200).json({
            status: "success",
            statusCode: 200,
            message: "Plan update successfully",
            data: {}
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: "fail",
            statusCode: 500,
            message: "Something went wrong.",
            data: {}
        });
    }
}

const deletePlan = async (req, res, next) => {
    try {
        const { id } = req?.params;

        const [err, assets] = await planRepository.findOneById(id,{});

        if (!assets) {
            return res.status(404).json({
                status: "fail",
                statusCode: 404,
                message: "Plan not found",
                data: {}
            });
        }

        await planRepository.deleteOne({_id: new mongoose.Types.ObjectId(id)});

        return res.status(200).json({
            status: "success",
            statusCode: 200,
            message: "Plan deleted successfully",
            data: {}
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: "fail",
            statusCode: 500,
            message: "Something went wrong.",
            data: {}
        });
    }
}

export {
    addPlan,
    getPlan,
    updatePlan,
    deletePlan
};