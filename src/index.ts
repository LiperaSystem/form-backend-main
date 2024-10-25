import * as express from 'express';
import { router } from './router';
import * as cors from 'cors';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = `${process.env.MONGO_URI}`;
const port = process.env.PORT || 3000;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    const app = express();

    const corsOptions = {
      origin: [
        'http://localhost:5173',
        'https://formulario.lipera.com.br',
      ],
    };

    app.use(cors(corsOptions));
    app.use(express.json());
    app.use(router);

    app.listen(port, () => {
      console.log('Server is listening on port 3000');
    });
  })
  .catch((err) => {
    console.log(`Error connecting to MongoDB: ${err}`);
  });
