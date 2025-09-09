import { check, body } from "express-validator";
import mongoose from "mongoose";

const validatePlanIds = [
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

const validateCreatePlan = [
    check("name")
        .notEmpty()
        .withMessage("Name is require")
        .isString()
        .withMessage("Name must be string"),
    check("title")
        .if(body("title").notEmpty())
        .isString()
        .withMessage("Title must be string"),
    check("description")
        .if(body("description").notEmpty())
        .isString()
        .withMessage("Description must be string"),
    check("type")
        .if(body("type").notEmpty())
        .isIn(["team", "individual"])
        .withMessage("Type must 'team' OR 'individual'"),
    check("price")
        .notEmpty()
        .withMessage("Price is require")
        .isFloat({ min: 0 })
        .withMessage("Price is invalid"),
    check("duration")
        .notEmpty()
        .withMessage("Duration is require")
        .isIn(["monthly", "yearly"])
        .withMessage("Duration must be monthly or yearly"),
    check("features")
        .if(body("features").notEmpty())
        .isArray()
        .withMessage("Features is must be array"),
    check("features.*")
        .isString()
        .withMessage("Each feature must be string.")
];

const validateUpdatePlan = [
    check("name")
        .if(body("name").notEmpty())
        .isString()
        .withMessage("Name must be string"),
    check("title")
        .if(body("title").notEmpty())
        .isString()
        .withMessage("Title must be string"),
    check("description")
        .if(body("description").notEmpty())
        .isString()
        .withMessage("Description must be string"),
    check("type")
        .if(body("type").notEmpty())
        .isIn(["team", "individual"])
        .withMessage("Type must 'team' OR 'individual'"),
    check("price")
        .if(body("price").notEmpty())
        .isFloat({ min: 0 })
        .withMessage("Price is invalid"),
    check("duration")
        .if(body("duration").notEmpty())
        .isIn(["monthly", "yearly"])
        .withMessage("Duration must be monthly or yearly"),
    check("features")
        .if(body("features").notEmpty())
        .isArray()
        .withMessage("Features is must be array"),
    check("features.*")
        .isString()
        .withMessage("Each feature must be string."),
    ...validatePlanIds
];


export {
    validateCreatePlan,
    validatePlanIds,
    validateUpdatePlan,
}