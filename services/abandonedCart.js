const cron = require("node-cron");
const { getInactiveCarts } = require("./cart");
const { sendPushNotification } = require("./notifications");

// Runs every 30 minutes
cron.schedule("*/30 * * * *", async () => {
  console.log("Running abandoned cart notifications...");
  try {
    const carts = await getInactiveCarts(1); // 1 hour inactivity

    for (const cart of carts) {
      if (cart.user.fcm_token) {
        await sendPushNotification(
          cart.user.fcm_token,
          "Your cart is waiting 🛒",
          "Complete your purchase before items sell out",
          { type: "CART", screen: "Cart" }
        );
      }
    }
  } catch (err) {
    console.error("Error in abandoned cart cron:", err);
  }
});
