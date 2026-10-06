const express = require('express');
const router = express.Router();

const cashfreeController = require('../controllers/cashfreeController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/pay', authMiddleware, cashfreeController.createCashfreePayment);
router.get('/payment-status/:orderId', cashfreeController.getPaymentStatus)

module.exports = router