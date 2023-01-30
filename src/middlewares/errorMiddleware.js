import AppError from '../utils/AppError.js';

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isAppError) {
    // APPLICATION ERROR, TRUSTED ERROR
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // PROGRAMMING OR OTHER UNKNOWN ERROR
    // 1) Log error
    console.error(err);

    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err, message: err.message };

    // 1) HANDLE INVALID MONGO ID ERROR
    if (err.name === 'CastError') {
      const message = `Invalid ${err.path}: ${err.value}.`;
      error = new AppError(message, 400);
    }

    // 2) HANDLE DUPLICATE FIELD VALUE ERROR
    if (err.code === 11000) {
      const message = `Duplicate field value: ${err?.keyValue?.name}. Please use another one.`;
      error = new AppError(message, 400);
    }

    // 3) HANDLE VALIDATION ERROR
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map((val) => val.message);
      const message = `Invalid input data. ${errors.join('. ')}.`;

      error = new AppError(message, 400);
    }

    // 4) HANDLE JSON WEB TOKEN ERROR
    if (err.name === 'JsonWebTokenError') {
      const message = 'Invalid token. Please log in again';

      error = new AppError(message, 401);
    }

    // 5) HANDLE TOKEN EXPIRED ERROR
    if (err.name === 'TokenExpiredError') {
      const message = 'Token has expired. Please log in again';

      error = new AppError(message, 401);
    }

    sendErrorProd(error, res);
  }
};

export default globalErrorHandler;
