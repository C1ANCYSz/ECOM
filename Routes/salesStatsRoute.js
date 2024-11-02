const express = require('express');
const { getSalesData } = require('../Controllers/productControllers');
const router = express.Router();

router.get('/', async (req, res) => {
  res.render('admin/salesStats');
});

router.get('/:period', getSalesData);

module.exports = router; // Export the router
