const Product = require("../models/Product");
const { maskData } = require("../utils/maskUtil");
const { unmaskData } = require("../utils/maskUtil");

exports.createProduct = async (req, res) => {
  const { name, price, quantity, location } = req.body;
  console.log("Request body:", req.body);
  try {
    const masked = maskData(`${name}-${location}`);
    const product = new Product({
      name,
      price,
      quantity,
      location,
      maskedData: masked
    });
    await product.save();
    res.status(201).json({ message: "Product created", product });
  } catch (err) {
    console.error("Error in createProduct:", err); 
    res.status(500).json({ message: "Server error" });
  }
};


exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();

    const decryptedProducts = products.map((p) => {
      let unmasked;
      try {
        unmasked = unmaskData(p.maskedData);  // 👈 this is the risky part
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
        createdAt: p.createdAt,
      };
    });

    res.json(decryptedProducts);
  } catch (err) {
    console.error("Error in getProducts:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
