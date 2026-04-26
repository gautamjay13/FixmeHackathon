const User = require('../models/User.model');
const Worker = require('../models/Worker.model');
const Booking = require('../models/Booking.model');
const Invoice = require('../models/Invoice.model');
const { sendResponse, ApiError } = require('../utils/apiResponse');
const { getIo } = require('../config/socket');
const { sendEmail, templates } = require('../utils/sendEmail');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalWorkers = await Worker.countDocuments();
    const totalBookings = await Booking.countDocuments();
    
    const startOfToday = new Date();
    startOfToday.setHours(0,0,0,0);
    const completedToday = await Booking.countDocuments({ status: 'completed', completedAt: { $gte: startOfToday } });

    // Revenue aggregations
    const todayRevenueAgg = await Invoice.aggregate([
      { $match: { paymentStatus: 'paid', issuedAt: { $gte: startOfToday } } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } }
    ]);
    const todayRevenue = todayRevenueAgg[0]?.total || 0;

    const totalRevenueAgg = await Invoice.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } }
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    const recentBookings = await Booking.find().sort({ createdAt: -1 }).limit(5).populate('userId', 'name');
    const pendingWorkerApprovals = await Worker.find({ isApproved: false }).populate('userId', 'name').limit(5);
    const topWorkers = await Worker.find().sort({ 'stats.avgRating': -1 }).limit(5).populate('userId', 'name');

    sendResponse(res, 200, 'Dashboard stats fetched', {
      stats: { totalUsers, totalWorkers, totalBookings, completedToday, revenue: { today: todayRevenue, month: 0 /* logic needed */, total: totalRevenue } },
      recentBookings,
      pendingWorkerApprovals,
      topWorkers,
      bookingsByService: [] // Aggregate logic needed
    });
  } catch (error) {
    next(error);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, search, isActive } = req.query;
    let query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) query.name = { $regex: search, $options: 'i' };

    const skip = (page - 1) * limit;
    const users = await User.find(query).skip(skip).limit(parseInt(limit));
    const total = await User.countDocuments(query);

    sendResponse(res, 200, 'Users fetched', users, { page: parseInt(page), limit: parseInt(limit), total });
  } catch (error) {
    next(error);
  }
};

exports.banUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    sendResponse(res, 200, 'User banned', { user });
  } catch (error) {
    next(error);
  }
};

exports.getWorkers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, isApproved, skill } = req.query;
    let query = {};
    if (isApproved !== undefined) query.isApproved = isApproved === 'true';
    if (skill) query.skills = { $in: [skill] };

    const skip = (page - 1) * limit;
    const workers = await Worker.find(query).populate('userId', 'name email').skip(skip).limit(parseInt(limit));
    sendResponse(res, 200, 'Workers fetched', workers);
  } catch (error) {
    next(error);
  }
};

exports.approveWorker = async (req, res, next) => {
  try {
    const worker = await Worker.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true }).populate('userId');
    
    // Notify via email
    await sendEmail({
      to: worker.userId.email,
      subject: 'Account Approved - FixNow',
      html: templates.workerApproved(worker.userId.name)
    });

    // Socket notification if online
    const Notification = require('../models/Notification.model');
    await Notification.create({
      userId: worker.userId._id,
      type: 'account',
      title: 'Account Approved',
      message: 'Your worker account has been approved!'
    });

    sendResponse(res, 200, 'Worker approved', { worker });
  } catch (error) {
    next(error);
  }
};

exports.rejectWorker = async (req, res, next) => {
  try {
    // Logic to delete worker profile or mark rejected
    await Worker.findByIdAndDelete(req.params.id);
    sendResponse(res, 200, 'Worker rejected', null);
  } catch (error) {
    next(error);
  }
};

exports.getBookings = async (req, res, next) => {
  try {
    const { status, page = 1 } = req.query;
    let query = status ? { status } : {};
    const bookings = await Booking.find(query).populate('userId workerId').skip((page - 1) * 10).limit(10);
    sendResponse(res, 200, 'Bookings fetched', bookings);
  } catch (error) {
    next(error);
  }
};

exports.getRevenueAnalytics = async (req, res, next) => {
  try {
    sendResponse(res, 200, 'Revenue analytics', { data: [], total: 0, growth: 0 }); // Placeholder
  } catch (error) {
    next(error);
  }
};

exports.getServiceAnalytics = async (req, res, next) => {
  try {
    sendResponse(res, 200, 'Service analytics', []); // Placeholder
  } catch (error) {
    next(error);
  }
};
