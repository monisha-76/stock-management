const Product = require("../models/Product");
const Order = require("../models/Order");

exports.purchaseProduct = async (req, res) => {
  const { productId, quantity, deliveryAddress } = req.body;
  const buyer = req.user.username; // from decoded JWT

  if (!productId || !quantity || !deliveryAddress) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    if (product.quantity < quantity) {
      return res.status(400).json({ error: "Not enough stock available." });
    }

    // Calculate total price
    const totalPrice = product.price * quantity;

    // Create the order
    const newOrder = new Order({
      productId,
      buyer,
      quantityPurchased: quantity,
      deliveryAddress,
      totalPrice,
      invoiceDetails: {
        generatedAt: new Date(),
        items: [
          {
            productName: product.name,
            productPrice: product.price,
            quantity: quantity,
            itemTotal: totalPrice,
          },
        ],
        totalAmount: totalPrice,
      },
    });

    await newOrder.save();
    await newOrder.populate("productId");

    // Reduce product quantity
    product.quantity -= quantity;
    await product.save();

    res.status(201).json({ message: "Purchase successful!", order: newOrder });
  } catch (err) {
    console.error("Purchase error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
};
