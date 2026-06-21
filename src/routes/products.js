// const express = require("express");
// const router = express.Router();
// const Product = require("../models/Product");
// const { protect, ownerOnly } = require("../middleware/auth");

// // GET /api/products  — public
// router.get("/", async (req, res) => {
//   try {
//     const { category, search } = req.query;
//     const filter = { active: true };
//     if (category && category !== "All") filter.category = category;
//     if (search) filter.name = { $regex: search, $options: "i" };
//     const products = await Product.find(filter).sort({ createdAt: -1 });
//     res.json(products);
//   } catch (e) { res.status(500).json({ message: e.message }); }
// });

// // GET /api/products/:id  — public
// router.get("/:id", async (req, res) => {
//   try {
//     const p = await Product.findById(req.params.id);
//     if (!p) return res.status(404).json({ message: "Not found" });
//     res.json(p);
//   } catch (e) { res.status(500).json({ message: e.message }); }
// });

// // POST /api/products  — owner only
// router.post("/", protect, ownerOnly, async (req, res) => {
//   try {
//     const product = await Product.create(req.body);
//     res.status(201).json(product);
//   } catch (e) { res.status(500).json({ message: e.message }); }
// });

// // PUT /api/products/:id  — owner only
// router.put("/:id", protect, ownerOnly, async (req, res) => {
//   try {
//     const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     if (!product) return res.status(404).json({ message: "Not found" });
//     res.json(product);
//   } catch (e) { res.status(500).json({ message: e.message }); }
// });

// // DELETE /api/products/:id  — owner only
// router.delete("/:id", protect, ownerOnly, async (req, res) => {
//   try {
//     await Product.findByIdAndDelete(req.params.id);
//     res.json({ message: "Deleted" });
//   } catch (e) { res.status(500).json({ message: e.message }); }
// });

// module.exports = router;
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { protect, ownerOnly } = require("../middleware/auth");

// Define schema inline with NO enum restriction
const productSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  category:  { type: String, required: true }, // FREE TEXT - no enum
  price:     { type: Number, required: true },
  img:       { type: String, default: "" },
  desc:      { type: String, default: "" },
  tag:       { type: String, default: "" },
  stock:     { type: Number, default: 99 },
  mrp:       { type: Number, default: 0 },
  active:    { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

// Use existing model or create new one
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

// GET /api/products — public
router.get("/", async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = { active: true };
    if (category && category !== "All") filter.category = category;
    if (search) filter.name = { $regex: search, $options: "i" };
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/products/:id — public
router.get("/:id", async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: "Not found" });
    res.json(p);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/products — owner only
router.post("/", protect, ownerOnly, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT /api/products/:id — owner only
router.put("/:id", protect, ownerOnly, async (req, res) => {
  try {
    // runValidators:false skips the old enum check completely
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: false }
    );
    if (!product) return res.status(404).json({ message: "Not found" });
    res.json(product);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// DELETE /api/products/:id — owner only
router.delete("/:id", protect, ownerOnly, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;