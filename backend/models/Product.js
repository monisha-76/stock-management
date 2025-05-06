const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: Number,
  quantity: Number,
  maskedData: String,
  location: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Product", productSchema);
