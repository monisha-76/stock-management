const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const purchaseController = require("../controllers/purchaseController");
const Order = require("../models/Order");

// 🛒 Purchase Route (Only for Buyers)
router.post(
  "/",
  authMiddleware,
  (req, res, next) => {
    if (req.user.role !== "Buyer") {
      return res.status(403).json({ message: "Only buyers can make purchases." });
    }
    next();
  },
  purchaseController.purchaseProduct
);

// 📄 Invoice Route
router.get("/invoice/:orderId", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate("productId");

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    const invoiceData = {
      invoiceId: order._id,
      productName: order.productId.name,
      unitPrice: order.productId.price,
      quantity: order.quantityPurchased,
      totalPrice: order.totalPrice,
      deliveryAddress: order.deliveryAddress,
      purchasedAt: order.purchasedAt,
      buyer: order.buyer,
    };

    res.status(200).json(invoiceData);
  } catch (err) {
    console.error("Invoice fetch error:", err);
    res.status(500).json({ message: "Error generating invoice." });
  }
});

router.get("/my-orders", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "Buyer") {
      return res.status(403).json({ message: "Only buyers can access order history." });
    }

    const orders = await Order.find({ buyer: req.user.username }) // Use username or id depending on your model
      .populate("productId")
      .sort({ purchasedAt: -1 });

    const formatted = orders.map((order) => ({
      orderId: order._id,
      productName: order.productId.name,
      unitPrice: order.productId.price,
      quantity: order.quantityPurchased,
      totalPrice: order.totalPrice,
      deliveryAddress: order.deliveryAddress,
      purchasedAt: order.purchasedAt,
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error("Order history fetch error:", err);
    res.status(500).json({ message: "Failed to fetch order history." });
  }
});

module.exports = router;