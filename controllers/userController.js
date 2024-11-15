const User = require('./../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'success',
    message: 'This route is not yet finished',
  });
};

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'success',
    message: 'This route is not yet finished',
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'success',
    message: 'This route is not yet finished',
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'success',
    message: 'This route is not yet finished',
  });
};
