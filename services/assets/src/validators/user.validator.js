import { body, param } from 'express-validator';

export const validateCreateUser = [
  body('name')
    .notEmpty()
    .withMessage((value, { req }) => req.t('validation.name_required')),

  body('email')
    .notEmpty()
    .withMessage((value, { req }) => req.t('validation.email_required'))
    .bail()
    .isEmail()
    .withMessage((value, { req }) => req.t('validation.email_invalid')),

  body('phone')
    .isMobilePhone()
    .withMessage((value, { req }) => req.t('validation.phone_required')),

  body('password')
  .optional()
    .isLength({ min: 6 })
    .withMessage((value, { req }) => req.t('validation.password_required')),
];

export const validateUpdateUser = [
  param('id')
    .isMongoId()
    .withMessage((value, { req }) => req.t('validation.user_id_invalid')),

  body('name')
    .optional()
    .notEmpty()
    .withMessage((value, { req }) => req.t('validation.name_required')),

  body('email')
    .optional()
    .isEmail()
    .withMessage((value, { req }) => req.t('validation.email_invalid')),

     body('phone')
    .optional()
    .notEmpty()
    .withMessage((value, { req }) => req.t('phone number required')),

  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage((value, { req }) => req.t('validation.password_required')),
];

export const validateGetUserById = [
  param('id')
    .isMongoId()
    .withMessage((value, { req }) => req.t('validation.user_id_invalid')),
];

export const validateDeleteUser = [
  param('id')
    .isMongoId()
    .withMessage((value, { req }) => req.t('validation.user_id_invalid')),
];

export const validateStatusToggle = [
  param('id')
    .isMongoId()
    .withMessage((value, { req }) => req.t('validation.user_id_invalid'))
];