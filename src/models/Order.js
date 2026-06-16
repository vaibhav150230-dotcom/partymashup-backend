const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  itemId:    { type: String, required: true },
  name:      { type: String, required: true },
  img:       { type: String },
  price:     { type: Number, required: true },
  qty:       { type: Number, required: true },
  type:      { type: String, enum: ["product", "service"], required: true },
});

const orderSchema = new mongoose.Schema({
  orderId:       { type: String, unique: true }, // PM-2025-XXXX
  customer:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  customerName:  { type: String },
  customerEmail: { type: String },
  customerPhone: { type: String },
  items:         [orderItemSchema],
  total:         { type: Number, required: true },
  address:       { type: String, required: true },
  eventDate:     { type: String, default: "" },
  note:          { type: String, default: "" },
  paymentMethod: { type: String, enum: ["razorpay", "cod"], default: "cod" },
  paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
  razorpayOrderId:   { type: String, default: "" },
  razorpayPaymentId: { type: String, default: "" },
  status: {
    type: String,
    enum: ["placed", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"],
    default: "placed",
  },
  createdAt: { type: Date, default: Date.now },
});

// Auto-generate orderId before saving
orderSchema.pre("save", async function (next) {
  if (!this.orderId) {
    const count = await mongoose.model("Order").countDocuments();
    const year = new Date().getFullYear();
    this.orderId = `PM-${year}-${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
