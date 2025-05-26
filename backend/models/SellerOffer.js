// models/SellerOffer.js
const mongoose = require('mongoose');

const sellerOfferSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductRequest',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  message: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected'],
    default: 'Pending',
  },
  offeredAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('SellerOffer', sellerOfferSchema);
