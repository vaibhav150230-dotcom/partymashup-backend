const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { protect, ownerOnly } = require("../middleware/auth");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Store in memory, then upload to Cloudinary
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only images allowed"));
  },
});

// POST /api/upload/image  — owner only
router.post("/image", protect, ownerOnly, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // Upload buffer to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "partymashup", quality: "auto", fetch_format: "auto" },
        (error, result) => { if (error) reject(error); else resolve(result); }
      );
      stream.end(req.file.buffer);
    });

    res.json({ url: result.secure_url, publicId: result.public_id });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// DELETE /api/upload/image  — owner only
router.delete("/image", protect, ownerOnly, async (req, res) => {
  try {
    const { publicId } = req.body;
    if (publicId) await cloudinary.uploader.destroy(publicId);
    res.json({ message: "Deleted" });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
