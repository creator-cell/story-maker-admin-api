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

const router = express.Router();

// Public routes
router.post('/register', validateCreateUser, handleValidationErrors, createUser);
router.post('/login', validateLogin, handleValidationErrors, login);
router.post('/forgot-password', validateForgotPassword, handleValidationErrors, forgotPassword);
router.post('/reset-password', validateResetPassword, handleValidationErrors, resetPassword);
router.post('/verify-email', validateResetPassword, verifyEmail);

// Protected routes (only accessible if token is valid)

router.get('/',auth, permit('Super Admin', 'Support', 'Moderator'), handleValidationErrors, getAllUser);
router.post('/',auth, permit('Super Admin', 'Support', 'Moderator'), validateCreateUser, handleValidationErrors, createUser);
router.put('/:id', auth, permit('Super Admin', 'Support'), validateUpdateUser, handleValidationErrors, updateUser);
router.get('/:id', auth, permit('Super Admin', 'Support', 'Moderator'), validateGetUserById, handleValidationErrors, getUserById);
router.delete('/:id', auth, permit('Super Admin'), validateDeleteUser, handleValidationErrors, deleteUser);

export default router;
