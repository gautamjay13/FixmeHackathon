const Notification = require('../models/Notification.model');
const { sendResponse } = require('../utils/apiResponse');

exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ isRead: 1, createdAt: -1 });

    sendResponse(res, 200, 'Notifications fetched', notifications);
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    sendResponse(res, 200, 'Notification marked as read', null);
  } catch (error) {
    next(error);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user.id, isRead: false }, { isRead: true });
    sendResponse(res, 200, 'All notifications marked as read', null);
  } catch (error) {
    next(error);
  }
};

exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({ userId: req.user.id, isRead: false });
    sendResponse(res, 200, 'Unread count fetched', { count });
  } catch (error) {
    next(error);
  }
};
