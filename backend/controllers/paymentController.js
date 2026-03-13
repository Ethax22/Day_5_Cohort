const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/userModel');


const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createOrder = async (req, res) => {
    try {
        const options = {
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

const verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

    if (expectedSignature === razorpay_signature) {
        try {
            await User.updatePlan(req.user.id, 'premium');
            res.json({ message: "Payment verified successfully", success: true });
        } catch (error) {
            console.error("Plan Update Error:", error);
            res.status(500).json({ message: "Error updating plan", success: false });
        }
    } else {
        res.status(400).json({ message: "Invalid signature", success: false });
    }
};

module.exports = { createOrder, verifyPayment };