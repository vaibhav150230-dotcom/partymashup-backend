const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const { protect, ownerOnly } = require("../middleware/auth");

// POST /api/orders  — place order (customer)
router.post("/", protect, async (req, res) => {
  try {
    const { items, total, address, eventDate, note, paymentMethod, razorpayOrderId } = req.body;
    if (!items?.length || !total || !address)
      return res.status(400).json({ message: "Items, total and address are required" });

    const order = await Order.create({
      customer:      req.user._id,
      customerName:  req.user.name,
      customerEmail: req.user.email,
      customerPhone: req.user.phone,
      items,
      total,
      address,
      eventDate:     eventDate || "",
      note:          note || "",
      paymentMethod: paymentMethod || "cod",
      paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
      razorpayOrderId: razorpayOrderId || "",
    });

    res.status(201).json(order);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/orders/my  — customer's own orders
router.get("/my", protect, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/orders/:id  — single order (customer sees own, owner sees all)
router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("customer", "name email phone");
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (req.user.role !== "owner" && order.customer._id.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Access denied" });
    res.json(order);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/orders  — all orders (owner only)
router.get("/", protect, ownerOnly, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};
    const orders = await Order.find(filter)
      .populate("customer", "name email phone")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Order.countDocuments(filter);
    res.json({ orders, total, pages: Math.ceil(total / limit) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT /api/orders/:id/status  — update status (owner only)
router.put("/:id/status", protect, ownerOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id, { status }, { new: true }
    ).populate("customer", "name email phone");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT /api/orders/:id/cancel  — cancel order (customer)
router.put("/:id/cancel", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.customer.toString() !== req.user._id.toString() && req.user.role !== "owner")
      return res.status(403).json({ message: "Access denied" });
    if (["delivered", "cancelled"].includes(order.status))
      return res.status(400).json({ message: "Cannot cancel this order" });
    order.status = "cancelled";
    await order.save();
    res.json(order);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
