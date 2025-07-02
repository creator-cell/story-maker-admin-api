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

router.post('/', auth, checkPermission('write','Roles'), validateCreateRole, handleValidationErrors, createRole);
router.get('/', auth,  checkPermission('read','Roles'), getAllRoles);
router.get('/:id', auth,  checkPermission('read','Roles'), validateGetRoleById, handleValidationErrors, getRoleById);
router.put('/:id', auth, checkPermission('write','Roles') , validateUpdateRole, handleValidationErrors, updateRole);
router.delete('/:id', auth, checkPermission('write','Roles'), validateDeleteRole, handleValidationErrors, deleteRole);

export default router;
