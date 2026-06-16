const express = require("express");
const router = express.Router();
const Service = require("../models/Service");
const { protect, ownerOnly } = require("../middleware/auth");

router.get("/", async (req, res) => {
  try {
    const services = await Service.find({ active: true }).sort({ createdAt: -1 });
    res.json(services);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post("/", protect, ownerOnly, async (req, res) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json(service);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put("/:id", protect, ownerOnly, async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!service) return res.status(404).json({ message: "Not found" });
    res.json(service);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete("/:id", protect, ownerOnly, async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
