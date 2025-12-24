<<<<<<< HEAD
const Wishlist = require("../models/Wishlist");

// ✅ Add product to wishlist
// POST /api/wishlist
=======
// server/controllers/wishlistController.js

const Wishlist = require("../models/Wishlist");

//  Add product to wishlist
//  POST /api/wishlist
>>>>>>> 91e0fb2 (Fixing Login)
exports.addToWishlist = async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.body;

  try {
    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, products: [productId] });
    } else {
<<<<<<< HEAD
      // Prevent duplicates
=======
>>>>>>> 91e0fb2 (Fixing Login)
      if (wishlist.products.includes(productId)) {
        return res.status(400).json({ message: "Product already in wishlist" });
      }
      wishlist.products.push(productId);
    }

    await wishlist.save();
<<<<<<< HEAD

    // ✅ Populate product details before sending response
    const populated = await wishlist.populate("products");

    res.status(200).json({
      success: true,
      message: "Product added to wishlist",
      wishlist: populated,
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
=======
    res.status(200).json({ message: "Product added to wishlist", wishlist });
  } catch (error) {
>>>>>>> 91e0fb2 (Fixing Login)
    res.status(500).json({ message: "Failed to add", error: error.message });
  }
};

<<<<<<< HEAD
// ✅ Get wishlist
// GET /api/wishlist
exports.getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate("products");

    res.status(200).json({
      success: true,
      wishlist: wishlist || { products: [] },
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
=======
//  Get wishlist
//  GET /api/wishlist
exports.getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
      "products"
    );
    res.status(200).json(wishlist || { products: [] });
  } catch (error) {
>>>>>>> 91e0fb2 (Fixing Login)
    res.status(500).json({ message: "Failed to fetch", error: error.message });
  }
};

<<<<<<< HEAD
// ✅ Remove product from wishlist
// DELETE /api/wishlist/:productId
=======
//  Remove product from wishlist
//  DELETE /api/wishlist/:productId
>>>>>>> 91e0fb2 (Fixing Login)
exports.removeFromWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });

<<<<<<< HEAD
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }
=======
    if (!wishlist)
      return res.status(404).json({ message: "Wishlist not found" });
>>>>>>> 91e0fb2 (Fixing Login)

    wishlist.products = wishlist.products.filter(
      (prd) => prd.toString() !== req.params.productId
    );

    await wishlist.save();
<<<<<<< HEAD

    // ✅ Populate updated wishlist before sending
    const populated = await wishlist.populate("products");

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
      wishlist: populated,
    });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
=======
    res.status(200).json({ message: "Product removed", wishlist });
  } catch (error) {
>>>>>>> 91e0fb2 (Fixing Login)
    res.status(500).json({ message: "Failed to remove", error: error.message });
  }
};
