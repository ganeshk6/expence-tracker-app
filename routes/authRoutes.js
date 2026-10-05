const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

router.get('/register', authController.loginPage);
router.post('/signup', authController.signup);

module.exports = router