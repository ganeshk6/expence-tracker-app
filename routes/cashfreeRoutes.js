const express = require('express');
const router = express.Router();

const cashfreeController = require('../controllers/cashfreeController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/pay', authMiddleware, cashfreeController.createCashfreePayment);
router.get('/payment-status/:orderId', cashfreeController.getPaymentStatus);
router.get('/membership-status',authMiddleware,cashfreeController.getMembershipStatus);

module.exports = router