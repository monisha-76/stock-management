const Product = require("../models/Product");
const User = require("../models/User");

exports.getOwnerStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalSellers = await User.countDocuments({ role: "Seller" });
    const totalBuyers = await User.countDocuments({ role: "Buyer" });
    const totalQuantity = await Product.aggregate([
      { $group: { _id: null, total: { $sum: "$quantity" } } }
    ]);
    
    // Top 3 Sellers based on quantity
    const topSellers = await Product.aggregate([
      { $group: { _id: "$createdBy", totalQuantity: { $sum: "$quantity" } } },
      { $sort: { totalQuantity: -1 } },
      { $limit: 3 }
    ]);

    res.json({
      totalProducts,
      totalSellers,
      totalBuyers,
      totalQuantity: totalQuantity[0]?.total || 0,
      topSellers
    });
  } catch (err) {
    console.error("Error in getOwnerStats:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
