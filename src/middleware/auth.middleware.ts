import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
require('dotenv').config();

const secretKey = process.env.JWT_SECRET_KEY as string;

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authorizationHeader = req.headers.authorization;

  if (authorizationHeader) {
    const token = authorizationHeader.split(' ')[1];

    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        res.status(403).json('Login failed');
      } else {
        next();
      }
    });
  }
};
