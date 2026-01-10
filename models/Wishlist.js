const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  userId: { 
    type: String, // Or mongoose.Schema.Types.ObjectId if using custom auth
    required: true, 
    unique: true 
  },
  products: [{
    shopifyProductId: { type: String, required: true },
    addedAt: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model('Wishlist', wishlistSchema);