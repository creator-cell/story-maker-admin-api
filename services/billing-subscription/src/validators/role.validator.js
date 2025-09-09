import { body, param } from 'express-validator';

export const validateCreateRole = [
  body('name')
    .notEmpty()
    .withMessage('Role name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Role name must be between 2 and 50 characters')
    .trim(),
];

export const validateUpdateRole = [
  param('id')
    .isMongoId()
    .withMessage('Invalid role ID'),

  body('name')
  .optional()
    .notEmpty()
    .withMessage('Role name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Role name must be between 2 and 50 characters')
    .trim(),
];

export const validateGetRoleById = [
  param('id')
    .isMongoId()
    .withMessage('Invalid role ID'),
];

export const validateDeleteRole = [
  param('id')
    .isMongoId()
    .withMessage('Invalid role ID'),
];
