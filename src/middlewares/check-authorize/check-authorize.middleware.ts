import { ForbiddenError } from '@src/utils/error.utils';
import { RequestHandler } from 'express';
import { verify } from 'jsonwebtoken';

declare const process: {
  env: {
    SECRET: string;
  };
};

export const checkAuthorize: RequestHandler = async (req, _, next) => {
  if (req.path === '/api/authenticate') {
    next();
    return;
  }

  const accessToken = req.headers['x-access-token'];

  if (!accessToken || typeof accessToken !== 'string') {
    next(new ForbiddenError('Token not found.'));
    return;
  }

  try {
    verify(accessToken, process.env.SECRET);

    next();
    return;
  } catch (error) {
    next(new ForbiddenError('Failed to authorize.'));
    return;
  }
};
