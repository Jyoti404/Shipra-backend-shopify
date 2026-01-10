const Wishlist = require('../models/Wishlist');

// 1. ADD to Wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { shopifyProductId } = req.body;
    const userId = req.user.id;

    // 1. Validation: Don't save if the ID is missing
    if (!shopifyProductId) {
      return res.status(400).json({ message: "shopifyProductId is required" });
    }

    // 2. Use $addToSet to prevent duplicate items for the same product
    const wishlist = await Wishlist.findOneAndUpdate(
      { userId },
      { $addToSet: { products: { shopifyProductId } } },
      { upsert: true, new: true }
    );

    res.status(200).json(wishlist);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 2. REMOVE from Wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
const { productId } = req.params;
    const userId = req.user.id;

    // $pull removes the specific object from the products array
    const wishlist = await Wishlist.findOneAndUpdate(
      { userId },
{ $pull: { products: { shopifyProductId: productId } } },
      { new: true }
    );
if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }
    res.status(200).json({ message: "Product removed", wishlist });
  } catch (error) {
    res.status(500).json({ message: "Error removing from wishlist", error: error.message });
  }
};

// 3. FETCH User Wishlist
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return res.status(200).json({ products: [] });
    }

    res.status(200).json(wishlist);
  } catch (error) {
    res.status(500).json({ message: "Error fetching wishlist", error: error.message });
  }
};