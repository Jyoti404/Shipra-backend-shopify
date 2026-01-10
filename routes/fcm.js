const express = require('express');
const router = express.Router();

const {
  saveFcmToken,
  sendTestNotification,
} = require('../controllers/fcmController');

// Save device token
router.post('/register', saveFcmToken);

// Test notification
router.post('/test', sendTestNotification);

// 🔴 THIS LINE IS MANDATORY
module.exports = router;
