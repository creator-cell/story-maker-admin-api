import express from 'express';
import {
  validateCreateRole,
  validateUpdateRole,
  validateGetRoleById,
  validateDeleteRole
} from '../../validators/role.validator.js';

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

router.post('/', auth, permit('Super Admin'), validateCreateRole, handleValidationErrors, createRole);
router.get('/', auth, permit('Super Admin', 'Support', 'Moderator'), getAllRoles);
router.get('/:id', auth, permit('Super Admin', 'Support', 'Moderator'), validateGetRoleById, handleValidationErrors, getRoleById);
router.put('/:id', auth, permit('Super Admin'), validateUpdateRole, handleValidationErrors, updateRole);
router.delete('/:id', auth, permit('Super Admin'), validateDeleteRole, handleValidationErrors, deleteRole);

export default router;
