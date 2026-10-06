const { createOrder, getOrderDetails } = require('../services/cashfreeService');
const Order = require('../modules/order');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/response');

const createCashfreePayment = async (req, res) => {
    try{
        const userId = req.user.id;
        const amount = 499;
        const membershipType = 'PREMIUM_MONTHLY';
        const customerId = `USER_${userId}`;
        const customerPhone = "9999999999";
        const orderId =`ORDER_${Date.now()}_${userId}`;

        const order = await Order.create({
            userId:userId,
            order_id:orderId,
            amount: amount,
            currency: 'INR',
            payment_gateway: 'CASHFREE',
            status: 'PENDING',
            membership_type: membershipType

        })

        const cashfreeOrder = await createOrder(orderId,amount,'INR',customerId,customerPhone);
        await order.update({
            payment_session_id:cashfreeOrder.payment_session_id
        });

        return sendSuccessResponse(
            res,
            {
                order_id: orderId,
                payment_session_id:cashfreeOrder.payment_session_id,
                amount: amount
            },
            'Payment order created successfully',
            201
        );

    }catch(err){
        return sendErrorResponse(res, err.message, "Something error during create order", 500);
    }
}

const getPaymentStatus = async (req, res) => {

    try {
        const { orderId } = req.params;
        console.log(orderId)
        const payments = await getOrderDetails(orderId);
        
        const order = await Order.findOne({
            where: {
                order_id: orderId
            }
        });

        if (!order) {
            return res.status(404).render(
                'pages/payemntStatus',
                {
                    success: false,
                    message: 'Order not found'
                }
            );
        }
        const payment = payments[0];
        console.log(payment.payment_status)
        if (payment.payment_status === 'SUCCESS') {
            const startDate = new Date();
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 30);

            await order.update({
                status: 'PAID',
                payment_status: 'SUCCESS',
                membership_start_date:startDate,
                membership_end_date:endDate

            });

            return res.render(
                'pages/payemntStatus',
                {
                    success: true,
                    message:'🎉 Payment successful! Your Premium Membership is now active.',
                    orderId: orderId,
                    amount: order.amount,
                    startDate: startDate,
                    endDate: endDate
                }
            );
        }
        if (payment.payment_status === 'FAILED') {

            await order.update({
                status: 'FAILED',
                payment_status: 'FAILED'
            });

            return res.render('pages/payemntStatus', {
                success: false,
                status: 'FAILED',
                message: '❌ Payment failed. Please try again.',
                orderId: orderId,
                amount: order.amount
            });
        }
        if (payment.payment_status === 'USER_DROPPED') {

            await order.update({
                status: 'FAILED',
                payment_status: 'USER_DROPPED'
            });

            return res.render('pages/payemntStatus', {
                success: false,
                status: 'USER_DROPPED',
                message: '⚠️ Payment was cancelled. You can try again.',
                orderId: orderId,
                amount: order.amount
            });
        }
        await order.update({
            payment_status:payment.payment_status
        });
        return res.render('pages/payemntStatus', {
            success: false,
            status: payment.payment_status,
            message: `Payment is currently ${payment.payment_status}. Please wait or try again later.`,
            orderId: orderId,
            amount: order.amount
        });


    } catch (err) {

        console.error("Payment status error:",err.response?.data || err.message);
        return res.status(500).render(
            'pages/payemntStatus',
            {
                success: false,
                message:'Unable to verify payment status.'
            }
        );
    }
};

module.exports = {
    createCashfreePayment,
    getPaymentStatus
}