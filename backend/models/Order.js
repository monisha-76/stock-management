const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  buyer: {
    type: String, // can be buyer's username or userId based on your JWT
    required: true,
  },
  quantityPurchased: {
    type: Number,
    required: true,
    min: 1,
  },
  deliveryAddress: {
    type: String,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  purchasedAt: {
    type: Date,
    default: Date.now,
  },
   invoiceDetails: {
    // Invoice-related information
    generatedAt: { type: Date },
    items: [
      {
        productName: String,
        productPrice: Number,
        quantity: Number,
        itemTotal: Number,
      },
    ],
    totalAmount: { type: Number }, // Total amount including taxes (if any)
  },
});

module.exports = mongoose.model("Order", orderSchema);
