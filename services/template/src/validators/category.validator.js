import { body, param } from "express-validator";

export const validateCreateCategory = [
  body("name")
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Category name must be between 2 and 50 characters")
    .trim(),

  body("description")
    .optional()
    .isLength({ max: 200 })
    .withMessage("Description must not exceed 200 characters")
    .trim(),

  body("subCategories")
    .optional()
    .isArray()
    .withMessage("Subcategories must be an array of strings"),

  body("parentCategory").optional().isMongoId(),

  body("assets")
    .optional()
    .isArray()
    .withMessage("Assets must be an array of strings"),

  body("templates")
    .optional()
    .isArray()
    .withMessage("Templates must be an array of strings"),
];

export const validateUpdateCategory = [
  param("id").isMongoId().withMessage("Invalid category ID"),

  body("name")
    .optional()
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Category name must be between 2 and 50 characters")
    .trim(),

  body("description")
    .optional()
    .isLength({ max: 200 })
    .withMessage("Description must not exceed 200 characters")
    .trim(),

  body("subCategories")
    .optional()
    .isArray()
    .withMessage("Subcategories must be an array of strings"),

  body("assets")
    .optional()
    .isArray()
    .withMessage("Assets must be an array of strings"),

  body("templates")
    .optional()
    .isArray()
    .withMessage("Templates must be an array of strings"),
];

export const validateGetCategoryById = [
  param("id").isMongoId().withMessage("Invalid category ID"),
];

export const validateDeleteCategory = [
  param("id").isMongoId().withMessage("Invalid category ID"),
];
