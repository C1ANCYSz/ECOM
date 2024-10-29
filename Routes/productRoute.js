const express = require('express');

const Product = require('../models/Product');

const {
  getAllProducts,
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getFeaturedProducts,
  getSpecialProducts,
} = require('../Controllers/productControllers');

const { isloggedIn, protect } = require('../Controllers/authControllers');

const router = express.Router();
router.use(protect);

router.get('/', getAllProducts);

router.get('/featured', getFeaturedProducts);

router.get('/:id', protect, getProduct);

router.get('/special/:offer', getSpecialProducts);

router.get('/category/:category', getProductsByCategory);

router.post('/', addProduct);

router.put('/:id', updateProduct);

router.delete('/:id', deleteProduct);

module.exports = router;
