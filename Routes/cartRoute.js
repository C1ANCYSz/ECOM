const express = require('express');

const router = express.Router();
const Customer = require('../models/Customer');
const Product = require('../models/Product');

const { protect } = require('../Controllers/authControllers');
const {
  addProduct,
  removeProduct,
  updateQuantity,
  toggleProduct,
} = require('../Controllers/cartAndWishlistControllers');

router.post('/add', protect, (req, res) => {
  addProduct('cart', req, res);
});

router.post('/toggle', protect, (req, res) => {
  toggleProduct('cart', req, res);
});

router.delete('/remove/:id', protect, (req, res) => {
  removeProduct('cart', req, res);
});

router.post('/updateQty', protect, updateQuantity);

module.exports = router;
