import { body, param } from "express-validator";

export const validateCreateTemplate = [
  body("name")
    .notEmpty()
    .withMessage("Template name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Category name must be between 2 and 50 characters")
    .trim(),

  //body("content").notEmpty().withMessage("Template content is required").trim(),
];

export const validateUpdateTemplate = [
  param("id").isMongoId().withMessage("Invalid category ID"),

  body("name")
    .optional()
    .notEmpty()
    .withMessage("Template name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Template name must be between 2 and 50 characters")
    .trim(),

  body("content").optional().notEmpty().trim(),

  body("status").optional(),
];

export const validateGetTemplateById = [
  param("id").isMongoId().withMessage("Invalid template ID"),
];

export const validateDeleteTemplate = [
  param("id").isMongoId().withMessage("Invalid template ID"),
];

export const validateCloneTemplate = [
  param("id").isMongoId().withMessage("Invalid template ID"),
];
