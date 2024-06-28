import Express from 'express';
import bodyParser from 'body-parser';
import UserRouter from './routes/user.routes';
import { graphqlHTTP } from 'express-graphql';
import schema from './grapQL/schema/user.schema';
import corsMiddleware from './middleware/CORS.middleware';
import voucherRouter from './routes/event.routes';

const app = Express();
app.use(bodyParser.json());
app.use(Express.json());
app.use(corsMiddleware);

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
