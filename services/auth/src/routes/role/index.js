import express from 'express';
import {
  validateCreateRole,
  validateUpdateRole,
  validateGetRoleById,
  validateDeleteRole
} from '../../validators/role.validator.js';
import checkPermission from '../../middlewares/middleware.js';
import handleValidationErrors from '../../middlewares/handleValidationError.js';
import {
  createRole,
  updateRole,
  getRoleById,
  getAllRoles,
  deleteRole
} from '../../controller/role.controller.js';

import auth from '../../middlewares/auth.js';
import permit from '../../middlewares/validateRequest.js'; 

const router = express.Router();

router.post('/', auth, validateCreateRole, handleValidationErrors, createRole);
router.get('/', auth,   getAllRoles);
router.get('/:id', auth,   validateGetRoleById, handleValidationErrors, getRoleById);
router.put('/:id', auth,  validateUpdateRole, handleValidationErrors, updateRole);
router.delete('/:id', auth, validateDeleteRole, handleValidationErrors, deleteRole);

export default router;
