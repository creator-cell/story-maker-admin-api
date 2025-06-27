import express from 'express';
import {
  validateCreateUser,
  validateUpdateUser,
  validateGetUserById,
  validateDeleteUser,
  validateLogin,
  validateForgotPassword,
  validateResetPassword
} from '../../validators/user.validator.js';

import handleValidationErrors from '../../middlewares/handleValidationError.js';
import {
  createUser,
  updateUser,
  getUserById,
  deleteUser,
  login,
  forgotPassword,
  resetPassword
  
} from '../../controller/user.controller.js';

const router = express.Router();

router.post('/register', validateCreateUser, handleValidationErrors, createUser);
router.post('/login', validateLogin, handleValidationErrors, login);
router.post('/forgot-password', validateForgotPassword, handleValidationErrors, forgotPassword);
router.post('/reset-password', validateResetPassword, handleValidationErrors, resetPassword);
router.put('/:id', validateUpdateUser, handleValidationErrors, updateUser);
router.get('/:id', validateGetUserById, handleValidationErrors, getUserById);
router.delete('/:id', validateDeleteUser, handleValidationErrors, deleteUser);


export default router;
