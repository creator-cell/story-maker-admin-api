import express from "express";
import auth from "../middlewares/auth.js";
import { checkMenuPermission } from "../middlewares/middleware.js";
import handleValidationErrors from "../middlewares/handleValidationError.js";

import {
    addPlan,
    updatePlan,
    getPlan,
    deletePlan
} from "../controller/plan.controller.js";

import {
    validateCreatePlan,
    validatePlanIds,
    validateUpdatePlan
} from "../validators/plan.validator.js";

const assetsRoutes = express.Router();

assetsRoutes.get('/',
    auth,
    checkMenuPermission("Plans","read"),
    getPlan
);

assetsRoutes.post('/',
    auth,
    checkMenuPermission("Plans","write"),
    validateCreatePlan,
    handleValidationErrors,
    addPlan
);

assetsRoutes.put('/:id',
    auth,
    checkMenuPermission("Plans","write"),
    validateUpdatePlan,
    handleValidationErrors,
    updatePlan
);

assetsRoutes.delete('/:id',
    auth,
    checkMenuPermission("Plans","write"),
    validatePlanIds,
    handleValidationErrors,
    deletePlan
);

export default assetsRoutes;