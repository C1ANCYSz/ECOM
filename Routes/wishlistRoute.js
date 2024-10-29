const express = require('express');
const Customer = require('../models/Customer');
const { protect } = require('../Controllers/authControllers');
const {
  addProduct,
  removeProduct,
  toggleProduct,
  moveToCart,
} = require('../Controllers/cartAndWishlistControllers');

const router = express.Router();

router.post('/toggle', protect, (req, res) => {
  toggleProduct('wishlist', req, res);
});

router.delete('/remove/:id', protect, (req, res) => {
  removeProduct('wishlist', req, res);
});

router.post('/add', protect, (req, res) => {
  addProduct('wishlist', req, res);
});

router.post('/move-to-cart/:id', protect, moveToCart);

module.exports = router;
