import express from 'express';
import { router } from './routes/routes';

const app = express();
const PORT = 3001;

app.use(express.json());
app.use('/api', router);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`app listening ${PORT} port`);
});
