import './utils/dotEnv.js'; // LOAD ENVIRONMENT VARIABLES, AVAILABLE FROM ANYWHERE

import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

import AppError from './utils/AppError.js';
import connectDB from './database/connect.js';

import globalErrorHandler from './middlewares/errorMiddleware.js';
import fileRouter from './routers/files/fileRouter.js';
import permissionRouter from './routers/auth/permissionRouter.js';
import roleRouter from './routers/auth/roleRouter.js';
import authRouter from './routers/auth/authRouter.js';
import userRouter from './routers/auth/userRouter.js';
import categoryRouter from './routers/product/categoryRouter.js';
import productRouter from './routers/product/productRouter.js';

// CATCH UNCAHGHT SYNC EXCEPTION
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHTEXCEPTION! Shutting down...');
  console.log(err.name, err.message);

  process.exit(1);
});

connectDB();

const PORT = process.env.PORT || 4000;

// EXPRESS APP
const app = express();

// 7) CORS
app.use(cors());

// MIDDLEWARES
// 1) HELMET
app.use(helmet());

// 2) BODY PARSER
app.use(express.json());

// 3) DATA SANITIZATION AGAINST NOSQL QUERY INJECTION
app.use(mongoSanitize());

// 4) PREVENT PARAMETER POLLUTION
app.use(hpp());

// 5) REQUEST LIMITER
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100,
  message: 'Too many requests from this IP, please try again in an hour',
});

app.use('/api', limiter);

// 6) LOGGER
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ROUTES
// DEFINE DEFAULT ROUTE
app.get('/', (req, res) => {
  res.send('WELCOME TO THE SERVER');
});

// 1) File
app.use('/api/v1/files', fileRouter);

// 2) Permission
app.use('/api/v1/permissions', permissionRouter);

// 3) Role
app.use('/api/v1/roles', roleRouter);

// 4) Auth
app.use('/api/v1/auth', authRouter);

// 5) User
app.use('/api/v1/users', userRouter);

// 6) Category
app.use('/api/v1/categories', categoryRouter);

// 7) Product
app.use('/api/v1/products', productRouter);

//  CATCH UNHANDLED ROUTES
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

// CATCH GLOBAL ERRORS
app.use(globalErrorHandler);

const server = app.listen(PORT, () => {
  console.log(`Server running on PORT: ${PORT}`);
});

// CATCH UNHANDLED PROMESE REJECTION
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);

  server.close(() => {
    process.exit(1);
  });
});
