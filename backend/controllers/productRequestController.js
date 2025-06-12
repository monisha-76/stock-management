const ProductRequest = require('../models/ProductRequest');
const SellerOffer = require('../models/SellerOffer');
// ✅ Import SellerOffer model

// @desc    Create a new product request
// @route   POST /api/requests
// @access  Buyer only
const createProductRequest = async (req, res) => {
  try {
    const { productName, description, quantity, urgency } = req.body;

    if (!productName || !quantity) {
      return res.status(400).json({ message: 'Product name and quantity are required' });
    }

    const newRequest = new ProductRequest({
      buyer: req.user.id,
      productName,
      description,
      quantity,
      urgency,
    });

    await newRequest.save();
    res.status(201).json({ message: 'Product request submitted successfully', request: newRequest });
  } catch (error) {
    console.error('Error creating product request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all product requests (Admin only)
// @route   GET /api/requests
// @access  Admin
const getAllRequests = async (req, res) => {
  try {
    const requests = await ProductRequest.find().populate('buyer', 'username');
    res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching product requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Broadcast product request to all sellers (Admin only)
// @route   POST /api/requests/:id/broadcast
// @access  Admin
const broadcastToSellers = async (req, res) => {
  try {
    const requestId = req.params.id;

    const request = await ProductRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Product request not found' });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({ message: `Request already broadcasted or fulfilled` });
    }

    request.status = 'Notified';
    await request.save();

    res.status(200).json({ message: 'Broadcast sent to sellers successfully', request });
  } catch (error) {
    console.error('Error broadcasting product request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all Notified product requests (Seller only)
// @route   GET /api/requests/notified
// @access  Seller
const getNotifiedRequestsForSellers = async (req, res) => {
  try {
    const requests = await ProductRequest.find({ status: 'Notified' }).populate('buyer', 'username');
    res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching notified requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ UPDATED: Submit offer using separate SellerOffer collection
// @route   POST /api/requests/:id/fulfill
// @access  Seller
const fulfillRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const { productId, quantity, price, message } = req.body;
    const sellerId = req.user.id;

    // Check if request exists and is in Notified state
    const request = await ProductRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'Notified') {
      return res.status(400).json({ message: 'Request is not available for fulfillment' });
    }

    // Create new offer
    const offer = new SellerOffer({
      seller: sellerId,
      requestId,
      product: productId,
      quantity,
      price,
      message,
    });

    await offer.save();

    res.status(201).json({ message: 'Offer submitted successfully', offer });
  } catch (error) {
    console.error('Error submitting offer:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyRequests = async (req, res) => {
  try {
    const buyerId = req.user.id;

    const requests = await ProductRequest.find({ buyer: buyerId })
      .populate({
        path: 'acceptedOffer',
        populate: {
          path: 'seller',
          select: 'username email',
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching buyer requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



module.exports = {
  createProductRequest,
  getAllRequests,
  broadcastToSellers,
  getNotifiedRequestsForSellers,
  fulfillRequest,
  getMyRequests,
};
