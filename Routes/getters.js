const express = require('express');

const router = express.Router();
const { protect, isLoggedIn } = require('../Controllers/authControllers');
const {
  home,
  getCart,
  getLogin,
  getSignup,
  getWishlist,
  getProfile,
  getCheckout,
} = require('../Controllers/gettersControllers');

router.get('/', isLoggedIn, home);

router.get('/profile', protect, getProfile);

router.get('/cart', protect, getCart);

router.get('/wishlist', protect, getWishlist);

router.get('/login', getLogin);

router.get('/signup', getSignup);

router.get('/checkout', protect, getCheckout);

module.exports = router;
