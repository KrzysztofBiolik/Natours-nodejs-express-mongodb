const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');
const cookieParser = require('cookie-parser');
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES
// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        'script-src': [
          "'self'",
          'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
          'https://cdnjs.cloudflare.com/ajax/libs/axios/0.20.0/axios.min.js',
        ],
        connectSrc: [
          "'self'",
          'http://127.0.0.1:3000',
          'https://api.stripe.com/',
          'ws://127.0.0.1:57524', // Add this line to allow WebSocket connections
          'https://*',
          'https://bundle.js:*',
        ],
        'style-src': [
          "'self'",
          'https://*.googleapis.com',
          'https://unpkg.com',
        ],
        'img-src': [
          "'self'",
          'data:',
          'https://*.openstreetmap.org',
          'https://unpkg.com',
        ],
      },
    },
  }),
);

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
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());
// Data sanitization against XSS attacks
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

app.use(compression());

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES
//middleware "tourRouter chcemy używać na takim route"
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/', viewRouter);

// all służy do wszystkich metod gttp (get,post...)
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
