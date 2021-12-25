import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { router } from '@routes/routes';
import sequelize from '@src/db';
import { errorHandler } from '@middlewares/error/error.middleware';
import { loggerHandler } from '@middlewares/logger/logger.middleware';
import { logger } from '@src/logger/logger';
import { checkAuthorize } from '@middlewares/check-authorize/check-authorize.middleware';
import { withLogger } from '@utils/logger.utils';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());
app.use(cors());
app.use(loggerHandler);
app.use(withLogger(checkAuthorize));
app.use('/api', router);
app.use(errorHandler);

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    app.listen(PORT, () => logger.info(`app listening ${PORT} port`));
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};

start();

process.on('uncaughtException', (err) => {
  logger.error(err);
  sequelize.close();
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  logger.error(err);
  sequelize.close();
  process.exit(1);
});
