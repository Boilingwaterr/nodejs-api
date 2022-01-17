import { logger } from '@src/logger/logger';
import { RequestHandler } from 'express';
import { performance } from 'perf_hooks';

export function withLogger(
  handler: RequestHandler
): (...args: Parameters<typeof handler>) => Promise<void> {
  return async (...args: Parameters<typeof handler>) => {
    const t0 = performance.now();

    // adding metadata for logging error
    const errorMetaData = {
      method: handler.name,
      arguments: {
        body: args[0].body,
        params: args[0].params,
        query: args[0].query
      }
    };
    args[1].locals.errorMetaData = errorMetaData;

    await handler(...args);
    const t1 = performance.now();

    // eslint-disable-next-line no-console
    logger.info(
      `Execution of method '${handler.name}' tooks ${Math.round(t1 - t0)}ms`
    );
  };
}
