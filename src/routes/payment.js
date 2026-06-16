const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/Order");
const { protect } = require("../middleware/auth");

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payment/create-order
// Creates a Razorpay order before checkout
router.post("/create-order", protect, async (req, res) => {
  try {
    const { amount } = req.body; // amount in rupees
    const options = {
      amount:   Math.round(amount * 100), // Razorpay needs paise
      currency: "INR",
      receipt:  `pm_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    res.json({
      orderId:  order.id,
      amount:   order.amount,
      currency: order.currency,
      key:      process.env.RAZORPAY_KEY_ID,
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/payment/verify
// Verify Razorpay signature after payment
router.post("/verify", protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature)
      return res.status(400).json({ message: "Payment verification failed" });

    // Update order payment status
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus:     "paid",
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId:   razorpay_order_id,
        status:            "confirmed",
      },
      { new: true }
    );

    res.json({ success: true, order });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
