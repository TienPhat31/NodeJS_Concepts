import session from 'express-session'

const sessionConfig = session({
  secret: process.env.SECRET_SESSION as string,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
})

export default sessionConfig
