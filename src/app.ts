import Express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import UserRouter from './routes/user.routes';
import { graphqlHTTP } from 'express-graphql';
import schema from './grapQL/schema/user.schema';
import corsMiddleware from './middleware/CORS.middleware';
import voucherRouter from './routes/event.routes';
import session from 'express-session';
import cookieParser from 'cookie-parser';

const app = Express();
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(Express.json());
app.use(corsMiddleware);

// Setup EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Setup Session
app.use(
  session({
    secret: 'your_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

// Route
app.use('/api/user', UserRouter);
app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    graphiql: true,
  })
);

app.use('/event', voucherRouter);

export default app;
