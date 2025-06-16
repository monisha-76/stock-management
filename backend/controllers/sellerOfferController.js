const SellerOffer = require('../models/SellerOffer');
const ProductRequest = require('../models/ProductRequest');
const Product = require('../models/Product');
const cloudinary = require('cloudinary').v2;

// @desc    Submit a new offer for a product request
// @route   POST /api/offers/:requestId
// @access  Seller only
const submitOffer = async (req, res) => {
  try {
    const { quantity, price, message, location, image } = req.body;  // added location
    const sellerId = req.user.id;
    const requestId = req.params.requestId;

    const request = await ProductRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Product request not found' });
    }

    if (request.status !== 'Notified') {
      return res.status(400).json({ message: 'Cannot offer on unnotified request' });
    }

    // Prevent duplicate offers
    const existingOffer = await SellerOffer.findOne({ seller: sellerId, requestId });
    if (existingOffer) {
      return res.status(400).json({ message: 'You have already submitted an offer for this request' });
    }

    const uploadResult = await cloudinary.uploader.upload(image, {
      folder: "products",
    });
    const offer = new SellerOffer({
      seller: sellerId,
      requestId,
      quantity,
      price,
      message,
      location,
      imageUrl: uploadResult.secure_url   
    });

    await offer.save();
    res.status(201).json({ message: 'Offer submitted successfully', offer });
  } catch (error) {
    console.error('Error submitting offer:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// @desc    Get all offers for a request (Admin only)
// @route   GET /api/offers/request/:requestId
// @access  Admin
const getOffersForRequest = async (req, res) => {
  try {
    const requestId = req.params.requestId;
    const offers = await SellerOffer.find({ requestId }).populate('seller', 'username');
    res.status(200).json(offers);
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Admin accepts an offer (updates offer + request status + creates product)
// @route   POST /api/offers/:offerId/accept
// @access  Admin
const acceptOffer = async (req, res) => {
  try {
    const offerId = req.params.offerId;

    const offer = await SellerOffer.findById(offerId).populate('seller', 'username');
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    const request = await ProductRequest.findById(offer.requestId);
    if (!request) {
      return res.status(404).json({ message: 'Associated product request not found' });
    }

    // Reject all other offers
    await SellerOffer.updateMany(
      { requestId: offer.requestId, _id: { $ne: offerId } },
      { $set: { status: 'Rejected' } }
    );

    // Accept this offer
    offer.status = 'Accepted';
    await offer.save();

    // Update request
    request.status = 'Fulfilled';
    request.acceptedOffer = offer._id;
    await request.save();

    // ✅ Create Product entry
    const newProduct = new Product({
      name: request.productName,
      price: offer.price,
      quantity: offer.quantity,
      location: offer.location || 'Not specified',
      imageUrl : offer.imageUrl,
      maskedData: '', // Optional: Set if you're masking data
      createdBy: offer.seller.username,
    });

    await newProduct.save();

    res.status(200).json({
      message: 'Offer accepted, request fulfilled, and product created',
      product: newProduct,
    });
  } catch (error) {
    console.error('Error accepting offer:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all requestIds for which seller has submitted offers
// @route   GET /api/offers/seller/my-offers
// @access  Seller only
const getMyOfferRequestIds = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const offers = await SellerOffer.find({ seller: sellerId }).select('requestId');
    const requestIds = offers.map((offer) => offer.requestId.toString());
    res.json(requestIds);
  } catch (error) {
    console.error('Error fetching seller offers:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all offers submitted by the logged-in seller
// @route   GET /api/offers/seller
// @access  Seller only
const getMyOffers = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const offers = await SellerOffer.find({ seller: sellerId })
      .populate('requestId', 'productName description status createdAt');

    res.status(200).json(offers);
  } catch (error) {
    console.error('Error fetching seller offers:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  submitOffer,
  getOffersForRequest,
  acceptOffer,
  getMyOfferRequestIds,
  getMyOffers,
};
