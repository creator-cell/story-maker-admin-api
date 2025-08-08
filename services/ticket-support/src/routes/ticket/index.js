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
  getAllModerator,
  getModeratorTicket,
  getUserTicket,
} from "../../controller/ticket.controller.js";

import auth from "../../middlewares/auth.js"; // JWT middleware

import checkPermission from "../../middlewares/middleware.js";
const router = express.Router();

router.get(
  "/",
  auth,
  checkPermission("read", "Tickets"),
  handleValidationErrors,
  getAllTicket
);
router.post(
  "/",
  auth,
  checkPermission("write", "Tickets"),
  validateCreateTicket,
  handleValidationErrors,
  createTicket
);
router.get(
  "/moderator",
  auth,
  checkPermission("read", "Tickets"),
  handleValidationErrors,
  getAllModerator
);
router.get(
  "/moderator/:id",
  auth,
  checkPermission("read", "Tickets"),
  validateUpdateTicket,
  handleValidationErrors,
  getModeratorTicket
);
router.get(
  "/user/:id",
  auth,
  checkPermission("read", "Tickets"),
  validateUpdateTicket,
  handleValidationErrors,
  getUserTicket
);
router.put(
  "/:id",
  auth,
  checkPermission("write", "Tickets"),
  validateUpdateTicket,
  handleValidationErrors,
  updateTicket
);
router.get(
  "/:id",
  auth,
  checkPermission("read", "Tickets"),
  validateGetTicketById,
  handleValidationErrors,
  getTicketById
);
router.delete(
  "/:id",
  auth,
  checkPermission("write", "Tickets"),
  validateDeleteTicket,
  handleValidationErrors,
  deleteTicket
);

export default router;
