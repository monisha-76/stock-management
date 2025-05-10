const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const {
  createProduct,
  getProductsByRole,
  deleteProduct,
  updateProduct,
} = require("../controllers/productController");


// Create product (Seller only)
router.post("/", auth, allowRoles("Seller"), createProduct);

// Get products (All roles)
router.get("/", auth, getProductsByRole);

// Delete product (Admin only)
router.delete("/:id", auth, allowRoles("Admin"), deleteProduct);

// Update product (Admin only)
router.put("/:id", auth, allowRoles("Admin"), updateProduct);
const { getOwnerStats } = require("../controllers/productController");
router.get("/stats/owner", auth, allowRoles("Owner"), getOwnerStats);


module.exports = router;