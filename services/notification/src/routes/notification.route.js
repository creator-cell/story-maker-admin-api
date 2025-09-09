import express from "express";
import auth from "../middlewares/auth.js";
import { checkMenuPermission } from "../middlewares/middleware.js";
import handleValidationErrors from "../middlewares/handleValidationError.js";

import {
    getNotification,
    handleSendMails,
    handleSendSms
} from "../controller/notification.controller.js";

import {
    validateSendNotification
} from "../validators/notification.validator.js";

const notificationRoute = express.Router();

notificationRoute.get('/', auth, checkMenuPermission("Notification", "read"), getNotification);

notificationRoute.post('/mail', auth, checkMenuPermission("Notification", "write"), validateSendNotification, handleValidationErrors, handleSendMails);

notificationRoute.post('/sms', auth, checkMenuPermission("Notification", "write"), validateSendNotification, handleValidationErrors, handleSendSms);

export default notificationRoute;