const Booking = require('../models/Booking.model');
const Worker = require('../models/Worker.model');
const { sendResponse, ApiError } = require('../utils/apiResponse');
const { getIo } = require('../config/socket');
const { calculateEstimate } = require('../utils/priceEstimator');

exports.createBooking = async (req, res, next) => {
  try {
    const { serviceType, problemTitle, problemDescription, address, coordinates, scheduledAt, workerId, isEmergency } = req.body;

    // Optional AI Analysis placeholder
    const aiAnalysis = req.body.aiAnalysis || null;

    const estimatedCost = calculateEstimate(serviceType, 2, isEmergency);

    const booking = await Booking.create({
      userId: req.user.id,
      workerId: workerId || undefined,
      serviceType,
      problemTitle,
      problemDescription,
      address,
      coordinates,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
      estimatedCost,
      isEmergency,
      aiAnalysis,
      timeline: [{ status: 'pending', note: 'Booking created' }]
    });

    getIo().emit('booking:new', { booking });

    sendResponse(res, 201, 'Booking created successfully', { booking });
  } catch (error) {
    next(error);
  }
};

exports.getUserBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10, sortBy = 'createdAt' } = req.query;
    
    let query = { userId: req.user.id };
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const bookings = await Booking.find(query)
      .populate('workerId')
      .sort({ [sortBy]: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    sendResponse(res, 200, 'Bookings fetched', bookings, {
      page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};

exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'name avatar phone')
      .populate('workerId');
      
    if (!booking) throw new ApiError(404, 'Booking not found', 'NOT_FOUND');

    // Security check: Only user, assigned worker, or admin can view
    const isOwner = booking.userId._id.toString() === req.user.id;
    let isAssignedWorker = false;
    
    if (req.user.role === 'worker') {
      const worker = await Worker.findOne({ userId: req.user.id });
      if (worker && booking.workerId && booking.workerId._id.toString() === worker._id.toString()) {
        isAssignedWorker = true;
      }
    }

    if (!isOwner && !isAssignedWorker && req.user.role !== 'admin') {
      throw new ApiError(403, 'Not authorized to view this booking', 'FORBIDDEN');
    }

    sendResponse(res, 200, 'Booking fetched', { booking });
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) throw new ApiError(404, 'Booking not found', 'NOT_FOUND');

    booking.status = status;
    booking.timeline.push({ status, note, updatedBy: req.user.id });
    
    if (status === 'started') booking.startedAt = new Date();
    
    await booking.save();

    // Notify user via socket
    getIo().to(`user_${booking.userId}`).emit(`booking:${status}`, { bookingId: booking.id, timestamp: new Date() });

    sendResponse(res, 200, 'Booking status updated', { booking });
  } catch (error) {
    next(error);
  }
};

exports.cancelBooking = async (req, res, next) => {
  try {
    const { cancelReason } = req.body;
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) throw new ApiError(404, 'Booking not found', 'NOT_FOUND');
    if (['inProgress', 'completed'].includes(booking.status)) {
      throw new ApiError(400, 'Cannot cancel an in-progress or completed booking', 'INVALID_STATE');
    }

    booking.status = 'cancelled';
    booking.cancelReason = cancelReason;
    booking.cancelledBy = req.user.id;
    booking.timeline.push({ status: 'cancelled', note: cancelReason, updatedBy: req.user.id });
    
    await booking.save();

    getIo().to(`booking_${booking.id}`).emit('booking:cancelled', { bookingId: booking.id, reason: cancelReason });

    sendResponse(res, 200, 'Booking cancelled', { booking });
  } catch (error) {
    next(error);
  }
};

exports.uploadImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) throw new ApiError(400, 'No files uploaded', 'FILE_MISSING');
    
    const cloudinary = require('../config/cloudinary');
    const images = [];
    
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, { folder: 'fixnow_bookings' });
      images.push({ url: result.secure_url, publicId: result.public_id });
      require('fs').unlinkSync(file.path);
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { $push: { images: { $each: images } } },
      { new: true }
    );

    sendResponse(res, 200, 'Images uploaded', { booking });
  } catch (error) {
    next(error);
  }
};

exports.completeBooking = async (req, res, next) => {
  try {
    const { finalCost, workDescription } = req.body;
    const booking = await Booking.findById(req.params.id).populate('userId workerId');
    if (!booking) throw new ApiError(404, 'Booking not found', 'NOT_FOUND');

    booking.status = 'completed';
    booking.completedAt = new Date();
    booking.finalCost = finalCost;
    booking.timeline.push({ status: 'completed', note: workDescription, updatedBy: req.user.id });

    // Generate Invoice logic (handled by another controller or here)
    const Invoice = require('../models/Invoice.model');
    const invoice = await Invoice.create({
      bookingId: booking._id,
      userId: booking.userId._id,
      workerId: booking.workerId._id,
      items: [{ description: workDescription || booking.serviceType, quantity: 1, unitPrice: finalCost, total: finalCost }],
      subtotal: finalCost,
      taxAmount: finalCost * 0.18,
      grandTotal: finalCost * 1.18
    });

    booking.invoiceId = invoice._id;
    await booking.save();

    getIo().to(`user_${booking.userId._id}`).emit('booking:completed', { bookingId: booking.id, invoice });

    sendResponse(res, 200, 'Booking completed', { booking, invoice });
  } catch (error) {
    next(error);
  }
};

exports.getActiveBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      userId: req.user.id,
      status: { $in: ['accepted', 'workerAssigned', 'inProgress'] }
    }).populate('workerId');

    sendResponse(res, 200, 'Active booking fetched', { booking });
  } catch (error) {
    next(error);
  }
};
