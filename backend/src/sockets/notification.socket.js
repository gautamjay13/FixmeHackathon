module.exports = (io, socket) => {
  // Clients will automatically receive notifications if they joined their 'user_${userId}' room in config/socket.js
  
  socket.on('notification:read', async (data) => {
    // Optionally handle read status real-time
    const Notification = require('../models/Notification.model');
    try {
      await Notification.findByIdAndUpdate(data.notificationId, { isRead: true });
    } catch (error) {
      console.error('Notification read error:', error);
    }
  });
};
