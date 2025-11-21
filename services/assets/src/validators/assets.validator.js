import { check, body } from "express-validator";
import mongoose from "mongoose";
import assetsRepository from "../respositories/assetsRepository.js";

const validateAssetsIds = [
    check("id")
        .notEmpty()
        .withMessage("Missing required field.")
        .custom((value,{req}) => {
            if (!mongoose.isValidObjectId(value)) {
                throw new Error("Invalid require");
            }
            return true;
        })
];

const validateCreateAssets = [
    check("name")
        .notEmpty()
        .withMessage("Name is require")
        .isString()
        .withMessage("Name must be string")
        .custom(async (value,{req}) => {
            const [error, result] = await assetsRepository.findOne({name: value});
            if (result) {
                throw new Error("Asset name already exists.");
            }
            return true;
        }),
    check("type")
        .notEmpty()
        .withMessage("Type is require")
        .isString()
        .withMessage("Type must be string"),
    check("format")
        .if(body("format").notEmpty())
        .isString()
        .withMessage("Format must be string"),
    check("description")
        .if(body("description").notEmpty())
        .isString()
        .withMessage("Description must be string"),
    check("category")
        .if(body("category").notEmpty())
        .custom((value) => {
            if (!mongoose.isValidObjectId(value)) {
                throw new Error("Invalid category");
            }
            return true;
        }),
    check("tags")
        .if(body("tags").notEmpty())
        .isArray()
        .withMessage("Tags must be array"),
    check("tags.*")
        .if(body("tags.*").notEmpty())
        .isString()
        .withMessage("Each tag must be a non-empty string.")
];

const validateUpdateAssets = [
    check("name")
        .if(body("name").notEmpty())
        .isString()
        .withMessage("Name must be string")
        .custom(async (value,{req}) => {
            const [error, result] = await assetsRepository.findOne({name: value, _id : { $ne : new mongoose.Types.ObjectId(req?.params?.id) }});
            if (result) {
                throw new Error("Asset name already exists.");
            }
            return true;
        }),
    check("url")
        .if(body("url").notEmpty())
        .isString()
        .withMessage("Url must be string"),
    check("type")
        .if(body("type").notEmpty())
        .isString()
        .withMessage("Type must be string"),
    check("format")
        .if(body("format").notEmpty())
        .isString()
        .withMessage("Format must be string"),
    check("description")
        .if(body("description").notEmpty())
        .isString()
        .withMessage("Description must be string"),
    check("category")
        .if(body("category").notEmpty())
        .custom((value) => {
            if (!mongoose.isValidObjectId(value)) {
                throw new Error("Invalid category");
            }
            return true;
        }),
    check("tags")
        .if(body("tags").notEmpty())
        .isArray()
        .withMessage("Tags must be array"),
    check("tags.*")
        .if(body("tags.*").notEmpty())
        .isString()
        .withMessage("Each tag must be a non-empty string."),
    ...validateAssetsIds
];

const validateUpdateStatus = [
    check("status")
        .notEmpty()
        .withMessage("Status is require")
        .isIn(["Reject", "Approve"])
        .withMessage("Wrong status"),
];

const validateCloneAssets = [
    check("assetId")
        .notEmpty()
        .withMessage("Invalid request.")
        .custom((value,{req}) => {
            if (!mongoose.isValidObjectId(value)) {
                throw new Error("Invalid require");
            }
            return true;
        })
];

export {
    validateAssetsIds,
    validateCreateAssets,
    validateUpdateAssets,
    validateUpdateStatus,
    validateCloneAssets
}