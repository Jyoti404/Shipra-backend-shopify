// wishlistRoutes.js

const express = require("express");
const router = express.Router();
const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} = require("../controllers/wishlistController");
const { protect, authorizeRole } = require("../middlewares/authMiddleware");

// All routes protected for buyers only
<<<<<<< HEAD
router.use(protect);
=======
router.use(protect, authorizeRole("buyer"));

>>>>>>> 91e0fb2 (Fixing Login)
router.post("/", addToWishlist);
router.get("/", getWishlist);
router.delete("/:productId", removeFromWishlist);

module.exports = router;
