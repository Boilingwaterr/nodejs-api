import express from 'express';
import { router } from './routes/routes';

const app = express();

app.use(express.json());
app.use('/api', router);

app.listen(3001, () => {
  // eslint-disable-next-line no-console
  console.log('app listening 3000 port');
});
