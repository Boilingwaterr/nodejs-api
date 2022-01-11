import { logger } from '@src/logger/logger';
import { RequestHandler } from 'express';

export const loggerHandler: RequestHandler = (
  { url, body, query, method, params },
  _,
  next
) => {
  try {
    const message = `url: ${url}, method: ${method}, ${
      Object.keys(body).length ? `body: ${JSON.stringify(body)},` : ''
    } ${Object.keys(query).length ? `query: ${JSON.stringify(query)},` : ''} ${
      Object.keys(params).length ? `query: ${JSON.stringify(params)}` : ''
    }`;

    logger.info(`${message}at ${new Date()}`);

    next();
  } catch (error) {
    next(error);
  }
};
