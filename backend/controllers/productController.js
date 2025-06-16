const Product = require("../models/Product");
const User = require("../models/User");
const { maskData, unmaskData } = require("../utils/maskUtil");
const cloudinary = require('cloudinary').v2;


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Create product (Seller only)
exports.createProduct = async (req, res) => {
  const { name, price, quantity, location, image } = req.body;
  try {
    const masked = maskData(`${name}-${location}`);
    const uploadResult = await cloudinary.uploader.upload(image, {
      folder: "products",
    });
    const product = new Product({
      name,
      price,
      quantity,
      location,
      maskedData: masked,
      createdBy: req.user.username,
      imageUrl: uploadResult.secure_url,
    });

    await product.save();
    res.status(201).json({ message: "Product created", product });
  } catch (err) {
    console.error("Error in createProduct:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Role-based GET: Sellers get their own, others get all
exports.getProductsByRole = async (req, res) => {
  const role = req.user.role;
  const username = req.user.username;

  try {
    let products;

    if (role === "Seller") {
      products = await Product.find({ createdBy: username });
    } else if (["Admin", "Buyer", "Owner"].includes(role)) {
      products = await Product.find();
    } else {
      return res.status(403).json({ message: "Access denied" });
    }

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
        imageUrl: p.imageUrl,
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

// ✅ Admin OR Seller (own product) can DELETE
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (
      req.user.role === "Seller" &&
      product.createdBy !== req.user.username
    ) {
      return res.status(403).json({ message: "Access denied: Not your product" });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error in deleteProduct:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Admin OR Seller (own product) can UPDATE
exports.updateProduct = async (req, res) => {
  const { name, price, quantity, location, image } = req.body;

  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (
      req.user.role === "Seller" &&
      product.createdBy !== req.user.username
    ) {
      return res.status(403).json({ message: "Access denied: Not your product" });
    }

    const masked = maskData(`${name}-${location}`);
    const uploadResult = await cloudinary.uploader.upload(image, {
      folder: "products",
    });
    product.name = name;
    product.price = price;
    product.quantity = quantity;
    product.location = location;
    product.maskedData = masked;
    product.imageUrl = uploadResult.secure_url;

    const updated = await product.save();

    res.json({ message: "Product updated successfully", product: updated });
  } catch (err) {
    console.error("Error in updateProduct:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Owner-only: Get stats about products and users
exports.getOwnerStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalQuantity = await Product.aggregate([
      { $group: { _id: null, total: { $sum: "$quantity" } } }
    ]);

    const totalSellers = await User.countDocuments({ role: "Seller" });
    const totalBuyers = await User.countDocuments({ role: "Buyer" });

    const topSellers = await Product.aggregate([
      { $group: { _id: "$createdBy", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 3 }
    ]);

    res.json({
      totalProducts,
      totalQuantity: totalQuantity[0]?.total || 0,
      totalSellers,
      totalBuyers,
      topSellers
    });
  } catch (err) {
    console.error("Error in getOwnerStats:", err);
    res.status(500).json({ message: "Server error" });
  }
};
