const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },          // Product name
  price: { type: Number, required: true },         // Price from accepted offer
  quantity: { type: Number, required: true },      // Quantity from accepted offer
  maskedData: { type: String, default: '' },       // Optional: for AES-masked info
  location: { type: String, default: 'Not specified' }, // Delivery location or general stock location
  imageUrl: {type: String},
  createdBy: { type: String, required: true },     // Seller username or ID
  createdAt: { type: Date, default: Date.now }     // Timestamp
});

module.exports = mongoose.model("Product", productSchema);
