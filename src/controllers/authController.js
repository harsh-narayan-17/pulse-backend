const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncWrapper = require('../utils/asyncWrapper');
const { success } = require('../utils/apiResponse');

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const safeUser = (user) => ({ id: user._id, name: user.name, email: user.email });

const signup = asyncWrapper(async (req, res) => {
  const { name, email, password } = req.body;
  const user = await User.create({ name, email, password });
  const token = signToken(user._id);
  success(res, { token, user: safeUser(user) }, 'Account created successfully', 201);
});

const login = asyncWrapper(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const token = signToken(user._id);
  success(res, { token, user: safeUser(user) }, 'Login successful');
});

module.exports = { signup, login };
