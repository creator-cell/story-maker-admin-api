
export const validateRequest = ({ body, params, query }) => (req, res, next) => {
  const { t } = req;

  const handleValidationError = (error) => {
    const translated = t('validationError', {
      message: error.details[0].message,
    });
    return res.status(400).json({ message: translated });
  };

  if (body) {
    const { error } = body.validate(req.body);
    if (error) return handleValidationError(error);
  }

  if (params) {
    const { error } = params.validate(req.params);
    if (error) return handleValidationError(error);
  }

  if (query) {
    const { error } = query.validate(req.query);
    if (error) return handleValidationError(error);
  }

  next();
};

const permit = (...allowedRoles) => {
  return (req, res, next) => {
    const { role } = req.user;
   
    if (allowedRoles.includes(role)) {
      next();
    } else {
      return res.status(403).json({ message: 'Forbidden: Access denied' });
    }
  };
};

export default permit;
