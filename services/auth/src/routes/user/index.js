import express from 'express';
import {
  validateCreateUser,
  validateLogin,
  validateForgotPassword,
  validateResetPassword
} from '../../validators/user.validator.js';

import handleValidationErrors from '../../middlewares/handleValidationError.js';
import {
  createUser,
  login,
  forgotPassword,
  resetPassword,
  verifyEmail
} from '../../controller/user.controller.js';

const router = express.Router();

// Public routes
router.post('/register', validateCreateUser, handleValidationErrors, createUser);
router.post('/login', validateLogin, handleValidationErrors, login);
router.post('/forgot-password', validateForgotPassword, handleValidationErrors, forgotPassword);
router.post('/reset-password', validateResetPassword, handleValidationErrors, resetPassword);
router.post('/verify-email', verifyEmail);

export default router;
