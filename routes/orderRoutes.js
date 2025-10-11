// // server/routes/orderRoutes.js

// const express = require("express");
// const router = express.Router();
// const { placeOrder, getUserOrders ,updateOrderStatus } = require("../controllers/orderController");
// const { protect, authorizeRole } = require("../middlewares/authMiddleware");

// // Place an order from cart
// router.post("/", protect, authorizeRole("buyer"), placeOrder);

// // Get user's orders
// router.get("/", protect, authorizeRole("buyer"), getUserOrders);

// // Seller route: update order status
// router.put(
//   "/:orderId/status",
//   protect,
//   authorizeRole("seller"),
//   updateOrderStatus
// );
// module.exports = router;

const express = require('express');
const router = express.Router();
const fetch = require('node-fetch'); // or global fetch if Node 18+
const { ensureAuth } = require('../middleware/authMiddleware'); // Your auth middleware

const SHOP_DOMAIN = process.env.SHOP_DOMAIN;
const STOREFRONT_ACCESS_TOKEN = process.env.STOREFRONT_ACCESS_TOKEN;

router.get('/customer/orders', ensureAuth, async (req, res) => {
  const customerAccessToken = req.user.token; // From your auth middleware
  const first = req.query.first || 2;

  const query = `
    query getCustomerOrders($customerAccessToken: String!, $first: Int!) {
      customer(customerAccessToken: $customerAccessToken) {
        orders(first: $first) {
          edges {
            node {
              id
              orderNumber
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              processedAt
              lineItems(first: 10) {
                edges {
                  node {
                    title
                    quantity
                    variant {
                      image {
                        url
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(`https://${SHOP_DOMAIN}/api/2024-10/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN
      },
      body: JSON.stringify({
        query,
        variables: { customerAccessToken, first }
      })
    });

    const data = await response.json();

    const orders = data.data.customer.orders.edges.map(edge => ({
      id: edge.node.id,
      orderNumber: edge.node.orderNumber,
      totalPrice: edge.node.totalPriceSet.shopMoney.amount,
      processedAt: edge.node.processedAt,
      lineItems: edge.node.lineItems.edges.map(item => ({
        title: item.node.title,
        quantity: item.node.quantity,
        image: item.node.variant?.image?.url
      }))
    }));

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

module.exports = router;
