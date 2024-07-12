import cors from 'cors';
require('dotenv').config();
import { ALLOW_PORT } from '../config/const';

const corsOptions: cors.CorsOptions = {
  origin: function (origin, callback) {
    if (!origin || ALLOW_PORT.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization'],
  credentials: true,
};

const corsMiddleware = cors(corsOptions);

export default corsMiddleware;
