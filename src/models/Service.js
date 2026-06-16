const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  price:     { type: Number, required: true },
  img:       { type: String, default: "" },
  desc:      { type: String, default: "" },
  tag:       { type: String, default: "" },
  active:    { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Service", serviceSchema);
