import { body, param } from "express-validator";

export const validateCreateTicket = [
  body("messages")
    .isArray({ min: 1 })
    .withMessage("Messages array is required"),

  body("messages.*.sender")
    .notEmpty()
    .withMessage("Sender is required")
    .bail()
    .isMongoId()
    .withMessage("Sender must be a valid MongoDB ObjectId"),

  body("messages.*.role")
    .notEmpty()
    .withMessage("Role is required")
    .bail()
    .isIn(["User", "Moderator"])
    .withMessage('Role must be either "user" or "moderator"'),

  body("messages.*.message")
    .notEmpty()
    .withMessage("Message content is required"),

  body("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .bail()
    .isMongoId()
    .withMessage("User ID must be a valid MongoDB ObjectId"),

  body("status")
    .optional()
    .isIn(["Open", "In Progress", "Resolved"])
    .withMessage("Invalid status value"),

  body("moderator")
    .optional()
    .isMongoId()
    .withMessage("Moderator must be a valid MongoDB ObjectId"),
];

export const validateGetTicketById = [
  param("id")
    .notEmpty()
    .withMessage("Ticket ID is required")
    .bail()
    .isMongoId()
    .withMessage("Invalid Ticket ID"),
];

export const validateUpdateTicket = [
  param("id")
    .notEmpty()
    .withMessage("Ticket ID is required")
    .bail()
    .isMongoId()
    .withMessage("Invalid Ticket ID"),

  body("status")
    .optional()
    .isIn(["Open", "In Progress", "Resolved"])
    .withMessage("Invalid status value"),

  body("moderator")
    .optional()
    .isMongoId()
    .withMessage("Moderator must be a valid MongoDB ObjectId"),

  body("messages")
    .optional()
    .isArray()
    .withMessage("Messages must be an array"),

  body("messages.*.sender")
    .optional()
    .isMongoId()
    .withMessage("Sender must be a valid MongoDB ObjectId"),

  body("messages.*.role")
    .optional()
    .isIn(["User", "Moderator"])
    .withMessage('Role must be either "user" or "moderator"'),

  body("messages.*.message")
    .optional()
    .isString()
    .withMessage("Message must be a string"),
];

export const validateDeleteTicket = [
  param("id")
    .notEmpty()
    .withMessage("Ticket ID is required")
    .bail()
    .isMongoId()
    .withMessage("Invalid Ticket ID"),
];
