const express = require('express');
const router = express.Router();
const Job = require('../models/Job.model');
const { sendResponse } = require('../utils/apiResponse');
const { protect } = require('../middleware/auth.middleware');

// GET /api/v1/stats — weekly stats for the dashboard
router.get('/', protect, async (req, res, next) => {
  try {
    // Get the start of the current week (Monday)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sun
    const diffToMonday = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek);
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + diffToMonday);
    weekStart.setHours(0, 0, 0, 0);

    const [completedJobs, pendingCount, acceptedCount] = await Promise.all([
      Job.find({ status: 'completed', completedAt: { $gte: weekStart } }),
      Job.countDocuments({ status: 'pending' }),
      Job.countDocuments({ status: 'accepted' }),
    ]);

    const totalEarnings = completedJobs.reduce((sum, j) => sum + (j.price || 0), 0);

    // Weekly goals from user (or defaults)
    const jobTarget = req.user.weeklyGoal?.jobTarget ?? 25;
    const earningsTarget = req.user.weeklyGoal?.earningsTarget ?? 15000;

    sendResponse(res, 200, 'Stats fetched', {
      completedJobs: completedJobs.length,
      totalEarnings,
      jobTarget,
      earningsTarget,
      pendingJobs: pendingCount,
      acceptedJobs: acceptedCount,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
