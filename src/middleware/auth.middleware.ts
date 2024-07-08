import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
require('dotenv').config();

const secretKey = process.env.JWT_ACCESS_KEY as string;

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      //res.redirect('api/user/login');
      return res
        .status(401)
        .json({ message: 'Authentication token is missing' });
    }
    const decoded = jwt.verify(token, secretKey);
    res.locals.user = decoded;

    next();
  } catch (error) {
    //res.redirect('api/user/login');
    res.status(401).json({ message: 'Invalid token' });
  }
};
