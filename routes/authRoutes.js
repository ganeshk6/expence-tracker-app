const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

router.get('/register', authController.loginPage)

module.exports = router