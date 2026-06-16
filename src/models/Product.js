const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  category:  { type: String, enum: ["Toys", "Balloons", "Decoration"], required: true },
  price:     { type: Number, required: true },
  img:       { type: String, default: "" },
  desc:      { type: String, default: "" },
  tag:       { type: String, default: "" },
  stock:     { type: Number, default: 99 },
  active:    { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Product", productSchema);
