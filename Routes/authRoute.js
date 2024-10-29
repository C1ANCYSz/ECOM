const express = require('express');
const router = express.Router();

const { login, logout, signup } = require('../Controllers/authControllers');

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);

module.exports = router;
