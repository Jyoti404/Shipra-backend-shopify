// services/cart.js
const Cart = require("../models/CartModel");

// Get carts that are inactive for given hours
async function getInactiveCarts(hours = 1) {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);

  // Find carts with at least 1 item and updated before cutoff
  return await Cart.find({
    updatedAt: { $lt: cutoff },
    "items.0": { $exists: true }, // ensure cart is not empty
  }).populate("user");
}

module.exports = { getInactiveCarts };
