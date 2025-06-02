const express = require('express');
const router = express.Router();

const {
  submitOffer,
  getOffersForRequest,
  acceptOffer,
  getMyOfferRequestIds,
  getMyOffers, // ✅ Added
} = require('../controllers/sellerOfferController');

const protect = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

// 📌 Seller submits offer for a product request
router.post('/:requestId', protect, allowRoles('Seller'), submitOffer);

// 📌 Admin gets all offers for a particular request
router.get('/request/:requestId', protect, allowRoles('Admin'), getOffersForRequest);

// 📌 Admin accepts one offer (others automatically rejected)
router.post('/:offerId/accept', protect, allowRoles('Admin'), acceptOffer);

// 📌 Seller gets only the request IDs they've submitted offers for
router.get('/seller/my-offers', protect, allowRoles('Seller'), getMyOfferRequestIds);

// 📌 Seller gets all their submitted offers (full details)
router.get('/seller', protect, allowRoles('Seller'), getMyOffers); // ✅ Added

module.exports = router;
