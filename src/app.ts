import Express from 'express'
import path from 'path'
import bodyParser from 'body-parser'
import UserRouter from './routes/user.routes'
import { graphqlHTTP } from 'express-graphql'
import schema from './grapQL/schema/schema'
import corsMiddleware from './middleware/cors.middleware'
import voucherRouter from './routes/event.routes'
import cookieParser from 'cookie-parser'
import sessionConfig from './config/sessionConfig'

const app = Express()
app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(Express.json())
app.use(corsMiddleware)
app.use(sessionConfig)

// Setup EJS
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// Setup static file
app.use(Express.static(path.join(__dirname, 'public')))

// API Route
app.use('/users', UserRouter)

// GRAPHQL Route
app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    graphiql: true
  })
)

// EVENT Route
app.use('/events', voucherRouter)

export default app
