import express from "express";
import {
  validateCreateTemplate,
  validateUpdateTemplate,
  validateGetTemplateById,
  validateDeleteTemplate,
  validateCloneTemplate,
} from "../../validators/template.validator.js";

import handleValidationErrors from "../../middlewares/handleValidationError.js";
import {
  createTemplate,
  getAllTemplate,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  cloneTemplate,
  trackTemplateUsage,
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

router.post(
  "/getUsage",
  auth,
  checkPermission("read", "Template"),
  trackTemplateUsage
);
router.put(
  "/:id",
  auth,
  checkPermission("write", "Template"),
  validateUpdateTemplate,
  handleValidationErrors,
  updateTemplate
);

router.post(
  "/:id",
  auth,
  checkPermission("write", "Template"),
  validateCloneTemplate,
  handleValidationErrors,
  cloneTemplate
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
