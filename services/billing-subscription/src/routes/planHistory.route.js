import express from "express";
import auth from "../middlewares/auth.js";
import { checkMenuPermission } from "../middlewares/middleware.js";
import handleValidationErrors from "../middlewares/handleValidationError.js";

import {
    subscription
} from "../controller/subscription.controller.js";

import {
    planSubscription
} from "../validators/subscription.validator.js";

const subscriptionRoute = express.Router();

subscriptionRoute.post('/',
    auth,
    planSubscription,
    handleValidationErrors,
    subscription
);

export default subscriptionRoute;