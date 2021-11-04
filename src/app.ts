import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { router } from '@routes/routes';
import sequelize from '@src/db';

const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());
app.use('/api', router);

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    // eslint-disable-next-line no-console
    app.listen(PORT, () => console.log(`app listening ${PORT} port`));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }
};

start();
