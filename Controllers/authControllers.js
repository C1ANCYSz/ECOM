const jwt = require('jsonwebtoken');
const User = require('../models/Customer');
const validator = require('validator');
const Customer = require('../models/Customer');

const signTokenAndSetCookie = (id, res) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' ? true : false,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};

exports.login = async (req, res) => {
  let { email, password } = req.body;
  email = validator.escape(email);
  password = validator.escape(password);
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password',
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be atleast 6 characters long',
    });
  }

  const customer = await User.findOne({ email }).select('+password');

  if (
    !customer ||
    !(await customer.correctPassword(password, customer.password))
  ) {
    return res.status(401).json({
      success: false,
      message: 'Incorrect email or password',
    });
  }

  signTokenAndSetCookie(customer._id, res);

  req.user = customer;

  res.status(200).json({
    success: true,
    data: customer,
  });
};

exports.signup = async (req, res) => {
  let { email, password, confirmPassword, phoneNumber, name } = req.body;

  email = validator.escape(email);
  password = validator.escape(password);
  phoneNumber = validator.escape(phoneNumber);
  name = validator.escape(name);

  if (!email || !password || !phoneNumber) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password',
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Passwords do not match',
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be atleast 6 characters long',
    });
  }

  const candidateCustomer = await Customer.findOne({ email });
  if (candidateCustomer) {
    return res.status(400).json({
      success: false,
      message: 'Email already exists',
    });
  }

  const newCustomer = await Customer.create({
    email,
    password,
    confirmPassword,
    phoneNumber,
    name,
  });

  signTokenAndSetCookie(newCustomer._id, res);

  req.customer = newCustomer;

  res.status(201).json({
    success: true,
    data: newCustomer,
  });
};

exports.protect = async (req, res, next) => {
  let token;
  if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.redirect('/login');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return res.status(401).json({
      status: 'fail',
      message: 'The user belonging to this token does no longer exist.',
    });
  }

  req.user = currentUser;
  next();
};

exports.isLoggedIn = async (req, res, next) => {
  try {
    if (req.cookies.token) {
      const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);

      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      req.user = currentUser;
      return next();
    }
    return next();
  } catch (err) {
    console.error('Error verifying token:', err);
    return next();
  }
};

exports.logout = async (req, res) => {
  res.clearCookie('token');

  res.redirect('/');
};

exports.restrictTo = (...emails) => {
  console.log(emails);
  return (req, res, next) => {
    if (!emails.includes(req.user.email)) {
      return res.status(403).json({
        success: false,
        message:
          'You do not have permission to perform this action, unauthorized',
      });
    }
    next();
  };
};
