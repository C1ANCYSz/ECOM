// Assuming you're using Express.js
const express = require('express');
const Product = require('../models/Product');

const {
  searchSuggestions,
  getSearchResults,
} = require('../Controllers/searchControllers');

const router = express.Router();

router.get('/', getSearchResults);

router.get('/search-suggestions', searchSuggestions);

module.exports = router;
