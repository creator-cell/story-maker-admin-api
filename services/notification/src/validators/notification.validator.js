import { check, validationResult, body } from "express-validator";

const validateSendNotification = [
    check("message")
    .notEmpty()
    .withMessage("Message is required")
    .isString()
    .withMessage("Message must be string")
];

export {
    validateSendNotification,
    validationResult
};