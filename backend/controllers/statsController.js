const Product = require("../models/Product");
const User = require("../models/User");

exports.getStatistics = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalSellers = await User.countDocuments({ role: "Seller" });
    const totalQuantity = await Product.aggregate([
      { $group: { _id: null, total: { $sum: "$quantity" } } },
    ]);

    res.json({
      totalProducts,
      totalSellers,
      totalQuantity: totalQuantity[0]?.total || 0,
    });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ message: "Server error" });
  }
};
