const Product = require("../models/Product");
const { maskData, unmaskData } = require("../utils/maskUtil");

// Only for Sellers — masked data + creator tracking
exports.createProduct = async (req, res) => {
  const { name, price, quantity, location } = req.body;
  try {
    const masked = maskData(`${name}-${location}`);
    const product = new Product({
      name,
      price,
      quantity,
      location,
      maskedData: masked,
      createdBy: req.user.username // Save creator info
    });

    await product.save();
    res.status(201).json({ message: "Product created", product });
  } catch (err) {
    console.error("Error in createProduct:", err); 
    res.status(500).json({ message: "Server error" });
  }
};

// Role-based GET: Sellers get their own, others get all
exports.getProductsByRole = async (req, res) => {
  const role = req.user.role;
  const username = req.user.username;

  try {
    let products;

    if (role === "Seller") {
      // Sellers only see their own products
      products = await Product.find({ createdBy: username });
    } else if (role === "Admin" || role === "Buyer" || role === "Owner") {
      // Admin, Buyer, Owner see all products
      products = await Product.find();
    } else {
      return res.status(403).json({ message: "Access denied" });
    }

    // Decrypt/mask each product
    const decryptedProducts = products.map((p) => {
      let unmasked;
      try {
        unmasked = unmaskData(p.maskedData);
      } catch (e) {
        console.error("Decryption failed for product:", p._id, e.message);
        unmasked = null;
      }

      return {
        _id: p._id,
        name: p.name,
        price: p.price,
        quantity: p.quantity,
        location: p.location,
        maskedData: p.maskedData,
        unmaskedData: unmasked,
        createdBy: p.createdBy,
        createdAt: p.createdAt,
      };
    });

    res.json(decryptedProducts);
  } catch (err) {
    console.error("Error in getProductsByRole:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
