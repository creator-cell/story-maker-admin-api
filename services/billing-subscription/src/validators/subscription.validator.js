import { check, body, validationResult } from "express-validator";
import mongoose from "mongoose";

const planSubscription = [
    check("planId")
        .notEmpty()
        .withMessage("Plan is require")
        .custom((value) => {
            if (!mongoose.isValidObjectId(value)) {
                throw new Error("Invalid plan");
            }
            return true;
        })
];

export {
    planSubscription, 
    validationResult
}