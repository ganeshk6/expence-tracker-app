import { Cashfree, CFEnvironment } from "cashfree-pg"; 

const cashfree = new Cashfree(CFEnvironment.SANDBOX, process.env.CASHFREE_APP_ID, process.env.CASHFREE_SECRET_KEY);

export const createOrder = async(
    orderId,
    orderAmount,
    orderCurrency = "INR",
    customerId,
    customerPhone
) => {
    try{
        const expiryDate = new Date(Date.now() + 60 * 60 * 1000) // 1 hours from now
        const fromattedExpiryDate = expiryDate.toISOString();
        
        var request = {
            "order_amount": orderAmount,
            "order_currency": orderCurrency,
            "order_id": orderId,
            "customer_details": {
                "customer_id": customerId,
                "customer_phone": customerPhone
            },
            "order_meta": {
                "return_url": "http://localhost:3000/payment-status/"+orderId,
                "payment_methods": "cc,dc,upi"
            },
            "order_expiry_time": fromattedExpiryDate
        };

        const response = await cashfree.PGCreateOrder(request);
        return {
            payment_session_id:response.data.payment_session_id,
            order_id:response.data.order_id
        };
    }catch(err){
        console.log("Error from cashfree service page"+err)
    }
}

export const getOrderDetails = async (orderId) => {
    try {
        const response = await cashfree.PGOrderFetchPayments(orderId);

        return response.data;

    } catch (err) {
        console.error(
            "Cashfree fetch order error:",
            err.response?.data || err.message
        );

        throw err;
    }
};

