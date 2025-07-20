import { Cashfree,CFEnvironment } from "cashfree-pg";
const cashfree = new Cashfree(CFEnvironment.SANDBOX, "TEST430329ae80e0f32e41a393d78b923034", "TESTaf195616268bd6202eeb3bf8dc458956e7192a85");

export const createOrder = async (orderId, orderAmount, orderCurrency = "INR", customerId, customerPhone) => {
    try {
        const expiryDate = new Date(Date.now() + 60 * 60 * 1000);
        const formattedExpiryDate = expiryDate.toISOString();
        const request = {
            order_amount: orderAmount,
            order_currency: orderCurrency,
            order_id: orderId,
            customer_details: {
                customer_id: customerId,
                customer_phone: customerPhone
            },
            order_meta: {
                return_url: `http://localhost:3000/api/pay/${orderId}`,
                payment_methods: "ccc, upi, nb"
            },
            order_expiry_time: formattedExpiryDate
        };

        const res = await cashfree.PGCreateOrder(request);
        return res.data.payment_session_id;
    } catch (error) {
        console.error("Error creating Cashfree order:", error.response?.data || error.message);
        throw new Error("Failed to create Cashfree order"); // 🔥 Important: throw an error
    }
};


export const getOrderStatus = async (orderId) => {
    try {
        const response = await cashfree.PGOrderFetchPayments(orderId);
        console.log('Order fetched successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error:', error.response?.data?.message || error.message);
        return null;
    }
};
