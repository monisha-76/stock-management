const express = require('express');
const router = express.Router();

const {
  createProductRequest,
  getAllRequests,
  broadcastToSellers,
  getNotifiedRequestsForSellers,
  getMyRequests,  // <-- import the new controller function
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

// 📌 Buyer views their own product requests with accepted offer details
router.get('/my-requests', protect, allowRoles('Buyer'), getMyRequests);

module.exports = router;
