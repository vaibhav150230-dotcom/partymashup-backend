const express = require("express");
const router = express.Router();
const Order   = require("../models/Order");
const Product = require("../models/Product");
const Service = require("../models/Service");
const User    = require("../models/User");
const { protect, ownerOnly } = require("../middleware/auth");

// GET /api/admin/stats
router.get("/stats", protect, ownerOnly, async (req, res) => {
  try {
    const [totalOrders, totalProducts, totalServices, totalCustomers, revenueData] =
      await Promise.all([
        Order.countDocuments(),
        Product.countDocuments({ active: true }),
        Service.countDocuments({ active: true }),
        User.countDocuments({ role: "customer" }),
        Order.aggregate([
          { $match: { paymentStatus: "paid" } },
          { $group: { _id: null, total: { $sum: "$total" } } },
        ]),
      ]);

    const recentOrders = await Order.find()
      .populate("customer", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    const revenue = revenueData[0]?.total || 0;

    res.json({ totalOrders, totalProducts, totalServices, totalCustomers, revenue, recentOrders });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/admin/orders — all orders with filters
router.get("/orders", protect, ownerOnly, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status && status !== "all" ? { status } : {};
    const orders = await Order.find(filter)
      .populate("customer", "name email phone")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Order.countDocuments(filter);
    res.json({ orders, total, pages: Math.ceil(total / limit) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
