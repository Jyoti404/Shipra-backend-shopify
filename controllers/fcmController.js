const saveFcmToken = async (req, res) => {
  res.json({ message: 'Token saved' });
};

const sendTestNotification = async (req, res) => {
  res.json({ message: 'Notification sent' });
};

module.exports = {
  saveFcmToken,
  sendTestNotification,
};
