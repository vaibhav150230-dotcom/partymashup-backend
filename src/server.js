// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const dotenv = require("dotenv");

// dotenv.config();

// const app = express();

// // ── Middleware ──────────────────────────────────────────────
// app.use(cors({ origin: process.env.FRONTEND_URL || "*", credentials: true }));
// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ extended: true }));

// // ── Routes ──────────────────────────────────────────────────
// app.use("/api/auth",     require("./routes/auth"));
// app.use("/api/products", require("./routes/products"));
// app.use("/api/services", require("./routes/services"));
// app.use("/api/orders",   require("./routes/orders"));
// app.use("/api/payment",  require("./routes/payment"));
// app.use("/api/upload",   require("./routes/upload"));
// app.use("/api/admin",    require("./routes/admin"));

// // ── Health check ────────────────────────────────────────────
// app.get("/", (req, res) => res.json({ message: "PartyMashup API running 🎈" }));

// // ── Connect DB & Start ──────────────────────────────────────
// mongoose
//   .connect(process.env.MONGODB_URI)
//   .then(async () => {
//     console.log("✅ MongoDB connected");
//     await seedOwner(); // create owner account if not exists
//     app.listen(process.env.PORT || 5000, () =>
//       console.log(`🚀 Server running on port ${process.env.PORT || 5000}`)
//     );
//   })
//   .catch((err) => console.error("❌ DB connection failed:", err));

// // ── Seed owner account ──────────────────────────────────────
// async function seedOwner() {
//   const User = require("./models/User");
//   const bcrypt = require("bcryptjs");
//   const existing = await User.findOne({ role: "owner" });
//   if (!existing) {
//     const hashed = await bcrypt.hash(process.env.OWNER_PASSWORD || "Party@123", 10);
//     await User.create({
//       name: "PartyMashup Owner",
//       email: process.env.OWNER_EMAIL || "owner@partymashup.com",
//       password: hashed,
//       role: "owner",
//     });
//     console.log("✅ Owner account created:", process.env.OWNER_EMAIL);
//   }
// }
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// ── CORS — allow all origins (safe for small business site) ─
app.use(cors());
app.options("*", cors());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Routes ──────────────────────────────────────────────────
app.use("/api/auth",     require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/services", require("./routes/services"));
app.use("/api/orders",   require("./routes/orders"));
app.use("/api/payment",  require("./routes/payment"));
app.use("/api/upload",   require("./routes/upload"));
app.use("/api/admin",    require("./routes/admin"));

// ── Health check ────────────────────────────────────────────
app.get("/", (req, res) => res.json({ message: "PartyMashup API running 🎈" }));

// ── Global error handler ────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ message: err.message || "Server error" });
});

// ── Connect DB & Start ──────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("✅ MongoDB connected");
    await seedOwner();
    app.listen(process.env.PORT || 5000, () =>
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => console.error("❌ DB connection failed:", err));

// ── Seed owner account ──────────────────────────────────────
async function seedOwner() {
  const User = require("./models/User");
  const bcrypt = require("bcryptjs");
  const existing = await User.findOne({ role: "owner" });
  if (!existing) {
    const hashed = await bcrypt.hash(process.env.OWNER_PASSWORD || "Party@123", 10);
    await User.create({
      name: "PartyMashup Owner",
      email: process.env.OWNER_EMAIL || "owner@partymashup.com",
      password: hashed,
      role: "owner",
    });
    console.log("✅ Owner account created:", process.env.OWNER_EMAIL);
  } else {
    console.log("✅ Owner account exists:", existing.email);
  }
}