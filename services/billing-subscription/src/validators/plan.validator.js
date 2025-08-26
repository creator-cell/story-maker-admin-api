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
    check("plans")
        .isArray({min: 1})
        .withMessage("Plans must be an array with at least one item"),
    check("plans.*.price")
        .isNumeric()
        .withMessage("Price must be numeric")
        .notEmpty()
        .withMessage("Price is require"),
    check("plans.*.duration")
        .notEmpty()
        .withMessage("Duration is require")
        .isIn(["month", "week", "day"])
        .withMessage("Duration must be a one of: month, week, day"),
    check("plans.*.value")
        .notEmpty()
        .withMessage("Duration value is require")
        .isNumeric()
        .withMessage("Duration value must be numeric"),
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
    check("plans")
        .isArray({min: 1})
        .withMessage("Plans must be an array with at least one item"),
    check("plans.*.price")
        .isNumeric()
        .withMessage("Price must be numeric")
        .notEmpty()
        .withMessage("Price is require"),
    check("plans.*.duration")
        .notEmpty()
        .withMessage("Duration is require")
        .isIn(["month", "week", "day"])
        .withMessage("Duration must be a one of: month, week, day"),
    check("plans.*.value")
        .notEmpty()
        .withMessage("Duration value is require")
        .isNumeric()
        .withMessage("Duration value must be numeric"),
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