const express = require('express');

const router = express.Router();
const { protect } = require('../Controllers/authControllers');
const { getOrders } = require('../Controllers/orderControllers');
const { createOrder } = require('../Controllers/orderControllers');

router.get('/', protect, getOrders);

router.post('/', protect, createOrder);

module.exports = router;
