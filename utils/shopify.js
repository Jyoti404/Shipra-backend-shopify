// utils/shopify.js
const fetch = require('node-fetch');

async function fetchCustomerOrdersViaAdmin(shopifyCustomerId, first = 10) {
  console.log('🔍 Fetching orders for customer:', shopifyCustomerId);
  console.log('🔍 Environment check:', {
    domain: process.env.SHOPIFY_STORE_DOMAIN,
    hasToken: !!process.env.SHOPIFY_ADMIN_API_TOKEN,
    apiVersion: process.env.SHOPIFY_API_VERSION
  });

  // Corrected query with proper field names
  const query = `
    query getCustomerOrders($customerId: ID!, $first: Int!) {
      customer(id: $customerId) {
        orders(first: $first, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              id
              name
              createdAt
              processedAt
              displayFinancialStatus
              displayFulfillmentStatus
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              currentTotalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              subtotalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              currentTotalDiscountsSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              currentTotalTaxSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              lineItems(first: 10) {
                edges {
                  node {
                    id
                    title
                    quantity
                    image {
                      url
                      altText
                    }
                    originalUnitPriceSet {
                      shopMoney {
                        amount
                        currencyCode
                      }
                    }
                    originalTotalSet {
                      shopMoney {
                        amount
                        currencyCode
                      }
                    }
                    discountedUnitPriceSet {
                      shopMoney {
                        amount
                        currencyCode
                      }
                    }
                    discountedTotalSet {
                      shopMoney {
                        amount
                        currencyCode
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

  const variables = {
    customerId: shopifyCustomerId.startsWith('gid://')
      ? shopifyCustomerId
      : `gid://shopify/Customer/${shopifyCustomerId}`,
    first: parseInt(first)
  };

  console.log('🔍 GraphQL variables:', variables);

  const response = await fetch(`https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/${process.env.SHOPIFY_API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_API_TOKEN
    },
    body: JSON.stringify({ query, variables })
  });

  console.log('🔍 Response status:', response.status);
  
  const result = await response.json();
  console.log('🔍 Full Shopify response:', JSON.stringify(result, null, 2));

  if (result.errors) {
    console.error("❌ Full Shopify GraphQL error:", result.errors);
    throw new Error(`GraphQL Error: ${result.errors[0]?.message || "Unknown error"}`);
  }

  if (!result.data || !result.data.customer) {
    console.error("❌ No customer data found");
    throw new Error("Customer not found in Shopify");
  }

  const orders = result.data.customer?.orders?.edges || [];
  console.log(`✅ Found ${orders.length} orders`);
  
  return orders.map(edge => {
    const order = edge.node;
    
    // Use currentTotalPriceSet if available, fallback to totalPriceSet
    const totalPrice = order.currentTotalPriceSet?.shopMoney || order.totalPriceSet?.shopMoney;
    const subtotal = order.subtotalPriceSet?.shopMoney;
    const discounts = order.currentTotalDiscountsSet?.shopMoney;
    const taxes = order.currentTotalTaxSet?.shopMoney;
    
    return {
      id: order.id,
      orderNumber: order.name,
      createdAt: order.createdAt,
      processedAt: order.processedAt,
      financialStatus: order.displayFinancialStatus,
      fulfillmentStatus: order.displayFulfillmentStatus,
      
      // Provide detailed pricing breakdown
      pricing: {
        orderTotal: totalPrice ? `${totalPrice.amount} ${totalPrice.currencyCode}` : 'N/A',
        subtotal: subtotal ? `${subtotal.amount} ${subtotal.currencyCode}` : 'N/A',
        discounts: discounts ? `${discounts.amount} ${discounts.currencyCode}` : '0.0 INR',
        taxes: taxes ? `${taxes.amount} ${taxes.currencyCode}` : '0.0 INR'
      },
      
      lineItems: order.lineItems.edges.map(item => {
        const lineItem = item.node;
        
        // Use discounted price if available, fallback to original price
        const unitPrice = lineItem.discountedUnitPriceSet?.shopMoney || lineItem.originalUnitPriceSet?.shopMoney;
        const totalItemPrice = lineItem.discountedTotalSet?.shopMoney || lineItem.originalTotalSet?.shopMoney;
        
        return {
          id: lineItem.id,
          title: lineItem.title,
          quantity: lineItem.quantity,
          unitPrice: unitPrice ? `${unitPrice.amount} ${unitPrice.currencyCode}` : 'N/A',
          totalPrice: totalItemPrice ? `${totalItemPrice.amount} ${totalItemPrice.currencyCode}` : 'N/A',
          image: lineItem.image ? {
            url: lineItem.image.url,
            altText: lineItem.image.altText || lineItem.title
          } : null
        };
      })
    };
  });
}

module.exports = { 
  fetchCustomerOrdersViaAdmin
};
