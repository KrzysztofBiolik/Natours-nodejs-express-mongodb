const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently bookend tour
  const tour = await Tour.findById(req.params.tourId);

  // 2) create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    //url where the user will be redirected afret successful payment
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    // to pole pozwoli na przekazanie pewnych danych o sesji, którą stworzyliśmy
    // później gdy sesja będzie udana dostaniemy ponownie dostęp do obiektu sesji
    // i będziemy mogli dodać nowy zakup do bazy danych.
    client_reference_id: req.params.tourId,

    // wyżej dane o sesji, poniżej dane o zakupionym produkcie

    line_items: [
      {
        price_data: {
          unit_amount: tour.price * 100,
          currency: 'usd',
          product_data: {
            name: `${tour.name} Tour`,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
            description: tour.summary,
          },
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
  });

  // 3) create session as response
  res.status(200).json({
    status: 'success',
    session: session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // This is TEMPORARY because is UNSECURE
  const { tour, user, price } = req.query;

  if (!tour || !user || !price) return next();
  await Booking.create({ tour, user, price });

  res.redirect(req.originalUrl.split('?')[0]);
});
