import cors from 'cors';
import express, { Request, Response, NextFunction } from 'express';
require('dotenv').config();

const allowedOrigins = 'http://localhost:3000';

const corsOptions: cors.CorsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
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
