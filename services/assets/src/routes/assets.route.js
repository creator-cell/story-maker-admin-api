import express from "express";
import auth from "../middlewares/auth.js";
import { checkMenuPermission } from "../middlewares/middleware.js";
import handleValidationErrors from "../middlewares/handleValidationError.js";
import multer from "multer";
import {dirname} from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const store = multer.memoryStorage();

const uploads = multer({
    store,
    limits: { fileSize: 10 * 1028 * 1028 }
});

import {
    addAsset,
    fetchAsset,
    updateAsset,
    deleteAssets,
    updateStatus,
    cloneAssets
} from "../controller/assets.controller.js";

import {
    validateAssetsIds,
    validateCreateAssets,
    validateUpdateAssets,
    validateUpdateStatus,
    validateCloneAssets
} from "../validators/assets.validator.js";

const assetsRoutes = express.Router();

assetsRoutes.get('/', auth, checkMenuPermission("Assets","read"), fetchAsset);

assetsRoutes.post('/', auth, checkMenuPermission("Assets","write"), uploads.single('document'), validateCreateAssets, handleValidationErrors, addAsset);

assetsRoutes.post('/clone', auth, checkMenuPermission("Assets","write"), validateCloneAssets, handleValidationErrors, cloneAssets);

assetsRoutes.put('/status/:id', auth, checkMenuPermission("Assets","write"), validateUpdateStatus, handleValidationErrors, updateStatus);

assetsRoutes.put('/:id', auth, checkMenuPermission("Assets","write"), uploads.single('document'), validateUpdateAssets, handleValidationErrors, updateAsset);

assetsRoutes.delete('/:id', auth, checkMenuPermission("Assets","write"), validateAssetsIds, handleValidationErrors, deleteAssets);

assetsRoutes.use((err, req, res, next) => {
    if (err.code == "LIMIT_FILE_SIZE") {
        res.status(400).json({ success:false, message: "File size exceeds the limit of 10MB" });
    } else {
        next();
    }
});

export default assetsRoutes;