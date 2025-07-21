import express from 'express';
import {
  validateCreateUser,
  validateUpdateUser,
  validateGetUserById,
  validateDeleteUser,
  validateStatusToggle
} from '../../validators/user.validator.js';

import handleValidationErrors from '../../middlewares/handleValidationError.js';
import {
  createUser,
  updateUser,
  getUserById,
  deleteUser,
  getAllUser,
  userActiveToggle
} from '../../controller/user.controller.js';

import auth from '../../middlewares/auth.js'; // JWT middleware

import checkPermission from '../../middlewares/middleware.js';
const router = express.Router();

router.get('/',auth, checkPermission("read","Users"),  handleValidationErrors, getAllUser);

router.post('/',auth, checkPermission("write","Users"), validateCreateUser, handleValidationErrors, createUser);

router.put('/status/:id', auth, checkPermission("write","Users"), validateStatusToggle, handleValidationErrors, userActiveToggle);

router.put('/:id', auth, checkPermission("write","Users"), validateUpdateUser, handleValidationErrors, updateUser);

router.get('/:id', auth, checkPermission("read","Users"), validateGetUserById, handleValidationErrors, getUserById);

router.delete('/:id', auth, checkPermission("write","Users"), validateDeleteUser, handleValidationErrors, deleteUser);

export default router;
