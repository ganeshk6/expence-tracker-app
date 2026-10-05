const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

router.get('/register', authController.signupPage);
router.get('/login', authController.loginPage);
router.post('/api/signup', authController.signup);
router.post('/api/login', authController.createSignin);

module.exports = router