import { Permissions } from '@src/models/group.model';
import { RequestHandler } from 'express-serve-static-core';
import Joi from 'joi';

export const validateGroup: RequestHandler = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(4).max(20).required(),
    permissions: Joi.array()
      .items(
        Permissions.READ,
        Permissions.WRITE,
        Permissions.DELETE,
        Permissions.SHARE,
        Permissions.UPLOAD_FILES
      )
      .required()
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
