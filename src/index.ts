import express from 'express';
import { router } from './routes/routes';

const app = express();

app.use(express.json());
app.use('/api', router);

app.listen(3000, () => {
  console.log('app listening 3000 port');
});
