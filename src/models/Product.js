// const mongoose = require("mongoose");

// const productSchema = new mongoose.Schema({
//   name:      { type: String, required: true },
//   category:  { type: String, enum: ["Toys", "Balloons", "Decoration"], required: true },
//   price:     { type: Number, required: true },
//   img:       { type: String, default: "" },
//   desc:      { type: String, default: "" },
//   tag:       { type: String, default: "" },
//   stock:     { type: Number, default: 99 },
//   active:    { type: Boolean, default: true },
//   createdAt: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model("Product", productSchema);
const mongoose = require("mongoose");

// Delete cached model if it exists (prevents "Cannot overwrite model" error)
if (mongoose.models.Product) {
  delete mongoose.models.Product;
}

const productSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  category:  { type: String, required: true }, // FREE TEXT - no enum restriction
  price:     { type: Number, required: true },
  img:       { type: String, default: "" },
  desc:      { type: String, default: "" },
  tag:       { type: String, default: "" },
  stock:     { type: Number, default: 99 },
  mrp:       { type: Number, default: 0 },
  active:    { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Product", productSchema);