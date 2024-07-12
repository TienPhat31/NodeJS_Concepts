import session from 'express-session';
import { SECRET_SESSION } from './const';

const sessionConfig = session({
  secret: SECRET_SESSION,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
});

export default sessionConfig;
