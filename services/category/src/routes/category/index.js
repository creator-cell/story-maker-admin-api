import express from "express";
import {
  validateCreateCategory,
  validateUpdateCategory,
  validateGetCategoryById,
  validateDeleteCategory,
} from "../../validators/category.validator.js";

import handleValidationErrors from "../../middlewares/handleValidationError.js";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
} from "../../controller/category.controller.js";

import auth from "../../middlewares/auth.js"; // JWT middleware

import checkPermission from "../../middlewares/middleware.js";
const router = express.Router();

router.get(
  "/",
  auth,
  checkPermission("read", "Category"),
  handleValidationErrors,
  getAllCategories
);
router.post(
  "/",
  auth,
  checkPermission("write", "Category"),
  validateCreateCategory,
  handleValidationErrors,
  createCategory
);

router.put(
  "/:id",
  auth,
  checkPermission("write", "Category"),
  validateUpdateCategory,
  handleValidationErrors,
  updateCategory
);
router.get(
  "/:id",
  auth,
  checkPermission("read", "Category"),
  validateGetCategoryById,
  handleValidationErrors,
  getCategoryById
);
router.delete(
  "/:id",
  auth,
  checkPermission("write", "Category"),
  validateDeleteCategory,
  handleValidationErrors,
  deleteCategory
);

export default router;
