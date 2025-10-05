// routes/customerRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const { fetchCustomerOrdersViaAdmin } = require('../utils/shopify');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Proxy endpoint for customer orders
// routes/customerRoutes.js
router.get('/orders', authenticateToken, async (req, res) => {
  try {
    const { first = 10 } = req.query;
    console.log('📋 Orders request for user:', req.user.id);
    
    // Get user from JWT token
    const user = await User.findById(req.user.id);
    console.log('👤 Found user:', user ? { id: user._id, email: user.email, shopifyCustomerId: user.shopifyCustomerId } : 'null');
    
    if (!user || !user.shopifyCustomerId) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Fetch orders using Admin API
    const orders = await fetchCustomerOrdersViaAdmin(user.shopifyCustomerId, first);
    console.log('📦 Returning orders:', orders.length);
    
    res.json(orders);
  } catch (error) {
    console.error('❌ Error fetching customer orders:', error.message);
    console.error('❌ Full error:', error);
    res.status(500).json({ error: 'Failed to fetch orders', details: error.message });
  }
});


module.exports = router;
