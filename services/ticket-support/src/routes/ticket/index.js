import express from "express";
import {
  validateCreateTicket,
  validateGetTicketById,
  validateUpdateTicket,
  validateDeleteTicket,
} from "../../validators/ticket.validator.js";

import handleValidationErrors from "../../middlewares/handleValidationError.js";
import {
  createTicket,
  getAllTicket,
  getTicketById,
  updateTicket,
  deleteTicket,
} from "../../controller/ticket.controller.js";

import auth from "../../middlewares/auth.js"; // JWT middleware

import checkPermission from "../../middlewares/middleware.js";
const router = express.Router();

router.get(
  "/",
  auth,
  checkPermission("read", "Users"),
  handleValidationErrors,
  getAllTicket
);
router.post(
  "/",
  auth,
  checkPermission("write", "Users"),
  validateCreateTicket,
  handleValidationErrors,
  createTicket
);
router.put(
  "/:id",
  auth,
  checkPermission("write", "Users"),
  validateUpdateTicket,
  handleValidationErrors,
  updateTicket
);
router.get(
  "/:id",
  auth,
  checkPermission("read", "Users"),
  validateGetTicketById,
  handleValidationErrors,
  getTicketById
);
router.delete(
  "/:id",
  auth,
  checkPermission("write", "Users"),
  validateDeleteTicket,
  handleValidationErrors,
  deleteTicket
);

export default router;
