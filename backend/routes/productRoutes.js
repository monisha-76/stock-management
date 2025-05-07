const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

// Import role-based controllers from productController.js
const { createProduct, getProductsByRole } = require("../controllers/productController");

// Only Sellers can add products
router.post("/", auth, allowRoles("Seller"), createProduct);

// All roles can GET products (filtering is done in the controller)
router.get("/", auth, getProductsByRole);

module.exports = router;
