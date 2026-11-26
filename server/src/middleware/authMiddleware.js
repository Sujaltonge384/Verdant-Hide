// server/src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

exports.protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const err = new Error('Not authorized, token missing');
    err.statusCode = 401;
    throw err;
  }

  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id);
  if (!user) {
    const err = new Error('User no longer exists');
    err.statusCode = 401;
    throw err;
  }

  req.user = user;
  next();
});

exports.adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    const err = new Error('Admin access required');
    err.statusCode = 403;
    return next(err);
  }
  next();
};