import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 3000;
export const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://fat:tienphat31@cluster0.l42husx.mongodb.net/NodeJS?retryWrites=true&w=majority&appName=Cluster0';

export const SALT = Number(process.env.SALT) || 10;
export const JWT_ACCESS_KEY = process.env.JWT_ACCESS_KEY || 'access_secret';
export const JWT_REFRESH_KEY = process.env.JWT_REFRESH_KEY || 'refresh_secret';

export const REDIS_URI =
  process.env.REDIS_URI ||
  'redis://:S66fAWLCzbh4H70sG6DAsM58sNpeajYR@redis-14674.c252.ap-southeast-1-1.ec2.redns.redis-cloud.com:14674';

export const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
export const EMAIL_PORT = process.env.EMAIL_PORT || '587';
export const EMAIL = process.env.EMAIL || 'nguyentienphat2103@gmail.com';
export const PASSWORD = process.env.PASSWORD || 'PASSWORD';

export const SECRET_SESSION = process.env.SECRET_SESSION || 'your_session_secret';

export const ALLOW_PORT = process.env.ALLOW_PORT || 'http://localhost:3000';
