import { createOrder, getOrderStatus } from "../service/cashfreeService.js";
import { Payment } from "../model/payment.js";
import User from "../model/user.js";

export const processPayment = async (req, res) => {
    const { customerId, orderAmount } = req.body;
    const orderId = "ORDER" + Date.now();
    const customerPhone = "9999999999";
    const orderCurrency = "INR";

    try {
        const paymentSessionId = await createOrder(orderId, orderAmount, orderCurrency, String(customerId), customerPhone);
        console.log("Payment Session ID:", paymentSessionId);

        if (!paymentSessionId) {
            return res.status(400).json({ message: "Failed to create payment session" });
        }

        // Save initial payment record
        await Payment.create({
            orderId,
            paymentSessionId,
            orderCurrency,
            orderAmount,
            paymentStatus: "pending",
            userId: customerId
        });

        // Fetch latest payment status from Cashfree
       

        // Send final response
        res.json({ paymentSessionId, orderId });

    } catch (error) {
        console.error("Error in processPayment:", error.message);
        res.status(500).json({ message: "Internal Server error" });
    }
};


export const getPaymentDetailById = async (req, res) => {
    const orderId = req.params.id;
    try {
        const payment = await Payment.findOne({ where: { orderId } });
        if (!payment) {
            return res.status(404).send("Payment not found");
        }
        const customerId = payment.userId;

        const paymentStatus = await getOrderStatus(orderId);
        const status = paymentStatus?.[0]?.payment_status || "UNKNOWN";

        if (status === "SUCCESS") {
            await Payment.update({ paymentStatus: "success" }, { where: { orderId } });
            await User.update({ isPremium: true }, { where: { id: customerId } });
        } else {
            await Payment.update({ paymentStatus: "failed" }, { where: { orderId } });
        }

        // Show message and redirect after 5 seconds
        res.send(`
            <html>
              <head>
                <meta http-equiv="refresh" content="5; url=http://127.0.0.1:5500/index.html" />
              </head>
              <body style="font-family: Arial; text-align: center; margin-top: 100px;">
                <h2>Payment status: ${status}</h2>
                <p>You will be redirected in 5 seconds...</p>
              </body>
            </html>
        `);

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server error");
    }
};


