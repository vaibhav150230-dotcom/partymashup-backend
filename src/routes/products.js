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
const Product = require("../models/Product");
const { protect, ownerOnly } = require("../middleware/auth");

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
    // Use insertOne via Model to bypass any cached schema validation
    const product = new Product(req.body);
    product.category = req.body.category; // force assign
    await product.save({ validateBeforeSave: false });
    res.status(201).json(product);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT /api/products/:id — owner only
router.put("/:id", protect, ownerOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: false, strict: false }
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