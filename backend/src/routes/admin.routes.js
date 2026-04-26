const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

router.use(protect);
router.use(restrictTo('admin'));

router.get('/dashboard', adminController.getDashboardStats);

router.get('/users', adminController.getUsers);
router.patch('/users/:id/ban', adminController.banUser);

router.get('/workers', adminController.getWorkers);
router.patch('/workers/:id/approve', adminController.approveWorker);
router.patch('/workers/:id/reject', adminController.rejectWorker);

router.get('/bookings', adminController.getBookings);
router.get('/analytics/revenue', adminController.getRevenueAnalytics);
router.get('/analytics/services', adminController.getServiceAnalytics);

module.exports = router;
