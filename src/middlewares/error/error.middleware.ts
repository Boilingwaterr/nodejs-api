import {
  ApiError,
  badRequestError,
  ErrorStatusCode,
  ForbiddenError,
  UnauthorizedError
} from '@src/utils/error.utils';
import { ErrorRequestHandler } from 'express';
import { UniqueConstraintError } from 'sequelize';
import { ValidationError } from 'joi';
import { format } from 'util';
import { logger } from '@src/logger/logger';

export const errorHandler: ErrorRequestHandler = (err, _, res, next) => {
  const {
    method,
    arguments: { body, params, query }
  } = res.locals.errorMetaData;

  logger.error(
    'method: %s body: %s params: %s query: %s error: %s at: %s',
    method,
    JSON.stringify(body),
    JSON.stringify(params),
    JSON.stringify(query),
    err
  );

  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof UnauthorizedError) {
    res.status(ErrorStatusCode.Unauthorized).json({ message: err.message });
    return;
  }

  if (err instanceof ForbiddenError) {
    res.status(ErrorStatusCode.Forbidden).json({ message: err.message });
    return;
  }

  if (err instanceof UniqueConstraintError) {
    res.status(ErrorStatusCode.Conflict).json({ message: err.message });
    return;
  }

  if (err instanceof ValidationError && err.isJoi) {
    res
      .status(ErrorStatusCode.BadRequest)
      .json(badRequestError(format(err.details)));
    return;
  }

  if (err instanceof ApiError) {
    res.status(ErrorStatusCode.BadRequest).json({ message: err.message });
    return;
  }

  res.status(ErrorStatusCode.Internal).json({ message: err.message });
};
