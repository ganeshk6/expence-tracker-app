const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/register', authController.signupPage);
router.get('/login', authController.loginPage);
router.get('/forgot-password', authController.forgotPasswordForm);
router.post('/api/signup', authController.signup);
router.post('/api/login', authController.createSignin);
router.post('/password/resetpassword',authController.resetPassword);
router.post('/password/forgotpassword', authController.sendForgotPasswordLink);
router.get('/password/resetpassword/:id', authController.resetPasswordForm);

module.exports = router