const Razorpay = require('razorpay');

// Ensure you have RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createOrder = async (req, res) => {
    try {
        const options = {
            // Amount in paise. Example: ₹500 = 50000 paise
            amount: 50000,
            currency: "INR",
            receipt: `receipt_order_${Math.floor(Math.random() * 1000)}`
        };

        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error("Razorpay Order Error:", error);
        res.status(500).json({ message: "Error creating order" });
    }
};

module.exports = { createOrder };