const express = require('express');
const router = express.Router();

const {
  createProductRequest,
  getAllRequests,
  broadcastToSellers,
  getNotifiedRequestsForSellers,
   // ✅ Sellers submit offer via separate SellerOffer model
} = require('../controllers/productRequestController');

const protect = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

// 📌 Buyer creates product request
router.post('/', protect, allowRoles('Buyer'), createProductRequest);

// 📌 Admin views all product requests
router.get('/', protect, allowRoles('Admin'), getAllRequests);

// 📌 Admin broadcasts a product request to sellers
router.post('/:id/broadcast', protect, allowRoles('Admin'), broadcastToSellers);

// 📌 Seller views notified product requests
router.get('/notified', protect, allowRoles('Seller'), getNotifiedRequestsForSellers);


module.exports = router;
