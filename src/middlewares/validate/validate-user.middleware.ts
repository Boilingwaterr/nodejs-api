import { RequestHandler } from 'express-serve-static-core';
import Joi, { ErrorReport, ValidationErrorFunction } from 'joi';

const errorPasswordValidation = (errors: ErrorReport[]) => {
  let passError: ReturnType<ValidationErrorFunction> = '';
  errors.forEach((error) => {
    if (error.code === 'string.pattern.base') {
      error.message =
        'Password should contain at least one letter and one number';
      passError = error;
    } else if (error.code === 'string.empty') {
      error.message = 'Password is not allowed to be empty';
      passError = error;
    }
  });
  return passError;
};

export const validateUser: RequestHandler = (req, res, next) => {
  const schema = Joi.object({
    login: Joi.string().min(4).max(20).required(),
    password: Joi.string()
      .required()
      .pattern(/^.*(?=.*\d)(?=.*[a-zA-Z]).*$/)
      .error(errorPasswordValidation),
    age: Joi.number().min(4).max(130).required()
  });

  const options = {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true
  };

  const { error, value } = schema.validate(req.body, options);

  if (error) {
    res.status(400).json({
      message: `Validation error: ${error.details
        .map((detail) => detail.message)
        .join('\n')}`
    });
  } else {
    req.body = value;
    next();
  }
};
