// // const express = require("express");
// // const router = express.Router();
// // const Razorpay = require("razorpay");
// // const crypto = require("crypto");
// // const Order = require("../models/Order");
// // const { protect } = require("../middleware/auth");

// // const razorpay = new Razorpay({
// //   key_id:     process.env.RAZORPAY_KEY_ID,
// //   key_secret: process.env.RAZORPAY_KEY_SECRET,
// // });

// // // POST /api/payment/create-order
// // // Creates a Razorpay order before checkout
// // router.post("/create-order", protect, async (req, res) => {
// //   try {
// //     const { amount } = req.body; // amount in rupees
// //     const options = {
// //       amount:   Math.round(amount * 100), // Razorpay needs paise
// //       currency: "INR",
// //       receipt:  `pm_${Date.now()}`,
// //     };
// //     const order = await razorpay.orders.create(options);
// //     res.json({
// //       orderId:  order.id,
// //       amount:   order.amount,
// //       currency: order.currency,
// //       key:      process.env.RAZORPAY_KEY_ID,
// //     });
// //   } catch (e) { res.status(500).json({ message: e.message }); }
// // });

// // // POST /api/payment/verify
// // // Verify Razorpay signature after payment
// // router.post("/verify", protect, async (req, res) => {
// //   try {
// //     const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

// //     // Verify signature
// //     const body = razorpay_order_id + "|" + razorpay_payment_id;
// //     const expectedSignature = crypto
// //       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
// //       .update(body)
// //       .digest("hex");

// //     if (expectedSignature !== razorpay_signature)
// //       return res.status(400).json({ message: "Payment verification failed" });

// //     // Update order payment status
// //     const order = await Order.findByIdAndUpdate(
// //       orderId,
// //       {
// //         paymentStatus:     "paid",
// //         razorpayPaymentId: razorpay_payment_id,
// //         razorpayOrderId:   razorpay_order_id,
// //         status:            "confirmed",
// //       },
// //       { new: true }
// //     );

// //     res.json({ success: true, order });
// //   } catch (e) { res.status(500).json({ message: e.message }); }
// // });

// // module.exports = router;
// const express  = require("express");
// const router   = express.Router();
// const Razorpay = require("razorpay");
// const crypto   = require("crypto");
// const Order    = require("../models/Order");
// const { protect } = require("../middleware/auth");

// // GET /api/payment/test  — check if keys are loaded (no auth needed)
// router.get("/test", (req, res) => {
//   const keyId     = process.env.RAZORPAY_KEY_ID     || "";
//   const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
//   res.json({
//     keyIdPresent:     !!keyId,
//     keySecretPresent: !!keySecret,
//     keyIdPrefix:      keyId.slice(0, 8) || "MISSING",
//     nodeEnv:          process.env.NODE_ENV || "not set",
//   });
// });

// // POST /api/payment/create-order
// router.post("/create-order", protect, async (req, res) => {
//   try {
//     const keyId     = process.env.RAZORPAY_KEY_ID     || "";
//     const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

//     if (!keyId || !keySecret) {
//       return res.status(500).json({
//         message: `Razorpay keys missing on server. KEY_ID: ${!!keyId}, KEY_SECRET: ${!!keySecret}`
//       });
//     }

//     const { amount } = req.body;
//     if (!amount || Number(amount) <= 0) {
//       return res.status(400).json({ message: "Invalid amount: " + amount });
//     }

//     const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

//     const order = await razorpay.orders.create({
//       amount:   Math.round(Number(amount) * 100),
//       currency: "INR",
//       receipt:  `pm_${Date.now()}`,
//     });

//     res.json({
//       orderId:  order.id,
//       amount:   order.amount,
//       currency: order.currency,
//       key:      keyId,
//     });
//   } catch (e) {
//     console.error("Razorpay create-order error:", JSON.stringify(e));
//     res.status(500).json({
//       message:     e.message || "Razorpay order creation failed",
//       razorpayErr: e.error  || null,
//       statusCode:  e.statusCode || null,
//     });
//   }
// });

// // POST /api/payment/verify
// router.post("/verify", protect, async (req, res) => {
//   try {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

//     if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
//       return res.status(400).json({ message: "Missing payment fields" });
//     }

//     const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
//     const body     = razorpay_order_id + "|" + razorpay_payment_id;
//     const expected = crypto.createHmac("sha256", keySecret).update(body).digest("hex");

//     if (expected !== razorpay_signature) {
//       return res.status(400).json({ message: "Signature mismatch — payment not verified" });
//     }

//     if (orderId) {
//       await Order.findByIdAndUpdate(orderId, {
//         paymentStatus:     "paid",
//         razorpayPaymentId: razorpay_payment_id,
//         razorpayOrderId:   razorpay_order_id,
//         status:            "confirmed",
//       });
//     }

//     res.json({ success: true });
//   } catch (e) {
//     console.error("Razorpay verify error:", e.message);
//     res.status(500).json({ message: e.message || "Verification failed" });
//   }
// });

// module.exports = router;




const express  = require("express");
const router   = express.Router();
const Razorpay = require("razorpay");
const crypto   = require("crypto");
const Order    = require("../models/Order");
const { protect } = require("../middleware/auth");

// GET /api/payment/test — debug (no auth needed)
router.get("/test", (req, res) => {
  const keyId     = process.env.RAZORPAY_KEY_ID     || "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
  res.json({
    keyIdPresent:     !!keyId,
    keySecretPresent: !!keySecret,
    keyIdPrefix:      keyId.slice(0, 12) || "MISSING",
    isTestMode:       keyId.startsWith("rzp_test_"),
    isLiveMode:       keyId.startsWith("rzp_live_"),
  });
});

// POST /api/payment/create-order
router.post("/create-order", protect, async (req, res) => {
  try {
    const keyId     = process.env.RAZORPAY_KEY_ID     || "";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

    if (!keyId || !keySecret) {
      return res.status(500).json({
        message: `Razorpay keys missing. KEY_ID: ${!!keyId}, KEY_SECRET: ${!!keySecret}`
      });
    }

    const { amount } = req.body;
    const amountNum = Number(amount);
    if (!amountNum || amountNum <= 0) {
      return res.status(400).json({ message: "Invalid amount: " + amount });
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const order = await razorpay.orders.create({
      amount:          Math.round(amountNum * 100),
      currency:        "INR",
      receipt:         `pm_${Date.now()}`,
      payment_capture: 1,
    });

    console.log("Razorpay order created:", order.id);

    res.json({
      orderId:  order.id,
      amount:   order.amount,
      currency: order.currency,
      key:      keyId,
    });

  } catch (e) {
    console.error("Razorpay error:", JSON.stringify(e));
    res.status(500).json({
      message:       e.message || "Razorpay order creation failed",
      razorpayError: e.error   || null,
      statusCode:    e.statusCode || null,
      description:   e.error?.description || null,
    });
  }
});

// POST /api/payment/verify
router.post("/verify", protect, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment fields" });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
    const body      = razorpay_order_id + "|" + razorpay_payment_id;
    const expected  = crypto
      .createHmac("sha256", keySecret)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return res.status(400).json({ message: "Payment signature mismatch" });
    }

    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus:     "paid",
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId:   razorpay_order_id,
        status:            "confirmed",
      });
    }

    res.json({ success: true });
  } catch (e) {
    console.error("Razorpay verify error:", e.message);
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;