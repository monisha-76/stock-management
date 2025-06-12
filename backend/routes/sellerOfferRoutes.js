const express = require('express');
const router = express.Router();

const {
  submitOffer,
  getOffersForRequest,
  acceptOffer,                // ✅ This now includes Product creation logic
  getMyOfferRequestIds,
  getMyOffers,
} = require('../controllers/sellerOfferController');

const protect = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

// 📌 Seller submits an offer for a product request
router.post('/:requestId', protect, allowRoles('Seller'), submitOffer);

// 📌 Admin gets all offers for a particular request
router.get('/request/:requestId', protect, allowRoles('Admin'), getOffersForRequest);

// 📌 Admin accepts one offer and a product is created
router.post('/:offerId/accept', protect, allowRoles('Admin'), acceptOffer);

// 📌 Seller gets request IDs they've submitted offers for
router.get('/seller/my-offers', protect, allowRoles('Seller'), getMyOfferRequestIds);

// 📌 Seller gets all their submitted offers
router.get('/seller', protect, allowRoles('Seller'), getMyOffers);

module.exports = router;
