import express from 'express';
import {
  validateCreateUser,
  validateUpdateUser,
  validateGetUserById,
  validateDeleteUser,
  validateLogin
} from '../../validators/user.validator.js';

import handleValidationErrors from '../../middlewares/handleValidationError.js';
import {
  createUser,
  updateUser,
  getUserById,
  deleteUser,
  login
  
} from '../../controller/user.controller.js';

const router = express.Router();

router.post('/register', validateCreateUser, handleValidationErrors, createUser);
router.post('/login', validateLogin, handleValidationErrors, login);
router.put('/:id', validateUpdateUser, handleValidationErrors, updateUser);
router.get('/:id', validateGetUserById, handleValidationErrors, getUserById);
router.delete('/:id', validateDeleteUser, handleValidationErrors, deleteUser);


export default router;
