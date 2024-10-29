const express = require('express');

const { protect } = require('../Controllers/authControllers');

const router = express.Router();

const { addAdress } = require('../Controllers/orderControllers');

router.post('/add-address', protect, addAdress);

module.exports = router;
