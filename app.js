const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1) GLOBAL MIDDLEWARES
// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from save API
const limiter = rateLimit({
  // 100 requestów na godzinę
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request fform this IP, please try again in an hour!',
});
// będzie to działać na wszystkie route, które zaczynają się od "/api"
app.use('/api', limiter);

// Body parser, reading data from the body into req.body
// expres.json() to funckja, która może modyfikować przychodzące zapytanie o dane.
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());
// Data sanitization against XSS attacks
app.use(xss());

// Serving static files
app.use(express.static(`${__dirname}/public`));

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES
//middleware "tourRouter chcemy używać na takim route"

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// all służy do wszystkich metod gttp (get,post...)
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
