const fetch = require("node-fetch");
const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN;
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || "2024-10";


async function generateShopifyCustomerToken(email, password) {
  const query = `
    mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
      customerAccessTokenCreate(input: $input) {
        customerAccessToken {
          accessToken
          expiresAt
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = { input: { email, password } };

  const res = await fetch(`https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN
    },
    body: JSON.stringify({ query, variables })
  });

  const json = await res.json();

  if (json.errors || json.data.customerAccessTokenCreate.userErrors.length > 0) {
    console.error("Shopify token error:", json.errors, json.data.customerAccessTokenCreate.userErrors);
    throw new Error("Failed to create Shopify customer token");
  }

  return json.data.customerAccessTokenCreate.customerAccessToken.accessToken;
}

module.exports = { generateShopifyCustomerToken };
