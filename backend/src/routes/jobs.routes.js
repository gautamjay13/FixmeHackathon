const express = require('express');
const router = express.Router();
const Job = require('../models/Job.model');
const { sendResponse, ApiError } = require('../utils/apiResponse');
const { protect } = require('../middleware/auth.middleware');

// GET /api/v1/jobs?status=pending  — fetch jobs by status (all if no query)
router.get('/', protect, async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) {
      const allowed = ['pending', 'accepted', 'rejected', 'completed'];
      if (!allowed.includes(req.query.status)) {
        throw new ApiError(400, `Invalid status. Must be one of: ${allowed.join(', ')}`, 'INVALID_STATUS');
      }
      filter.status = req.query.status;
    }
    const jobs = await Job.find(filter).sort({ createdAt: -1 });
    sendResponse(res, 200, 'Jobs fetched', { jobs });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/jobs/:id/accept
router.patch('/:id/accept', protect, async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) throw new ApiError(404, 'Job not found', 'NOT_FOUND');
    if (job.status !== 'pending') {
      throw new ApiError(400, `Cannot accept a job with status: ${job.status}`, 'INVALID_TRANSITION');
    }
    job.status = 'accepted';
    job.acceptedAt = new Date();
    await job.save();
    sendResponse(res, 200, 'Job accepted', { job });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/jobs/:id/reject
router.patch('/:id/reject', protect, async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) throw new ApiError(404, 'Job not found', 'NOT_FOUND');
    if (job.status !== 'pending') {
      throw new ApiError(400, `Cannot reject a job with status: ${job.status}`, 'INVALID_TRANSITION');
    }
    job.status = 'rejected';
    await job.save();
    sendResponse(res, 200, 'Job rejected', { job });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/jobs/:id/complete
router.patch('/:id/complete', protect, async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) throw new ApiError(404, 'Job not found', 'NOT_FOUND');
    if (job.status !== 'accepted') {
      throw new ApiError(400, `Cannot complete a job with status: ${job.status}`, 'INVALID_TRANSITION');
    }
    job.status = 'completed';
    job.completedAt = new Date();
    await job.save();
    sendResponse(res, 200, 'Job completed', { job });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
