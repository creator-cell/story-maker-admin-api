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
  resetPassword,
  getAllUser,
  verifyEmail
} from '../../controller/user.controller.js';

import auth from '../../middlewares/auth.js'; // JWT middleware
import permit from '../../middlewares/validateRequest.js'; // Role-check middleware
import checkPermission from '../../middlewares/middleware.js';
const router = express.Router();

// Public routes
router.post('/register', validateCreateUser, handleValidationErrors, createUser);
router.post('/login', validateLogin, handleValidationErrors, login);
router.post('/forgot-password', validateForgotPassword, handleValidationErrors, forgotPassword);
router.post('/reset-password', validateResetPassword, handleValidationErrors, resetPassword);
router.post('/verify-email', validateResetPassword, verifyEmail);

// Protected routes (only accessible if token is valid)

router.get('/',auth, checkPermission('read','Users'), handleValidationErrors, getAllUser);
router.post('/',auth, checkPermission('write','Users'), validateCreateUser, handleValidationErrors, createUser);
router.put('/:id', auth, checkPermission('write','Users'), validateUpdateUser, handleValidationErrors, updateUser);
router.get('/:id', auth,checkPermission('read','Users'),validateGetUserById, handleValidationErrors, getUserById);
router.delete('/:id', auth, checkPermission('write','Users'), validateDeleteUser, handleValidationErrors, deleteUser);

export default router;
