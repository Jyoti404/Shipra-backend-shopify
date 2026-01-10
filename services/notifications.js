// backend/notifications.js
import admin from "./firebase.js";

/**
 * Send push notification to a single device
 * @param {string} token - FCM device token
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Optional data payload
 */
export async function sendPushNotification(token, title, body, data = {}) {
  try {
    const message = { token, notification: { title, body }, data };
    await admin.messaging().send(message);
    console.log("Notification sent to:", token);
  } catch (err) {
    console.error("Push error:", err);
  }
}
