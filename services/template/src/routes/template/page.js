import express from "express";
import {
  validateCreateTemplate,
  validateUpdateTemplate,
  validateGetTemplateById,
  validateDeleteTemplate,
} from "../../validators/Template.validator.js";

import handleValidationErrors from "../../middlewares/handleValidationError.js";
import {
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getAllTemplate,
  getTemplateById,
} from "../../controller/template.controller.js";

import auth from "../../middlewares/auth.js"; // JWT middleware

import checkPermission from "../../middlewares/middleware.js";
const router = express.Router();

router.get(
  "/",
  auth,
  checkPermission("read", "Template"),
  handleValidationErrors,
  getAllTemplate
);
router.post(
  "/",
  auth,
  checkPermission("write", "Template"),
  validateCreateTemplate,
  handleValidationErrors,
  createTemplate
);

router.put(
  "/:id",
  auth,
  checkPermission("write", "Template"),
  validateUpdateTemplate,
  handleValidationErrors,
  updateTemplate
);
router.get(
  "/:id",
  auth,
  checkPermission("read", "Template"),
  validateGetTemplateById,
  handleValidationErrors,
  getTemplateById
);
router.delete(
  "/:id",
  auth,
  checkPermission("write", "Template"),
  validateDeleteTemplate,
  handleValidationErrors,
  deleteTemplate
);

export default router;
