const express = require('express');

const router = express.Router();
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const { protect } = require('../Controllers/authControllers');
const {
  getCategoryOfSoldProducts,
  getTopSoldProducts,
  getTopUsers,
  getSalesData,
} = require('../Controllers/productControllers');

const salesStatsRouter = require('../Routes/salesStatsRoute');

// Route for the admin panel
router.get('/', protect, async (req, res) => {
  const user = req.user;
  const categories = await getCategoryOfSoldProducts();
  const topProducts = await getTopSoldProducts();
  const topUsers = await getTopUsers();

  res.render('admin/adminPanel', {
    user,
    categories,
    topProducts,
    topUsers,
  });
});

router.get('/manage-products', protect, async (req, res) => {
  const user = req.user;
  const products = await Product.find();

  res.render('admin/manageProducts', { products, user });
});

router.get('/manage-users', protect, async (req, res) => {
  const user = req.user;

  const users = await Customer.find();

  res.render('admin/manageUsers', { users, user });
});

router.get('/manage-orders', protect, async (req, res) => {
  const user = req.user;

  const orders = await Order.find();

  res.render('admin/manageOrders', { orders, user });
});

router.use('/sales-stats', protect, salesStatsRouter);

module.exports = router;
