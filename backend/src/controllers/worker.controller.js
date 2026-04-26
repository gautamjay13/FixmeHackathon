const Worker = require('../models/Worker.model');
const User = require('../models/User.model');
const Booking = require('../models/Booking.model');
const { sendResponse, ApiError } = require('../utils/apiResponse');

exports.registerWorker = async (req, res, next) => {
  try {
    const existingWorker = await Worker.findOne({ userId: req.user.id });
    if (existingWorker) throw new ApiError(400, 'Worker profile already exists', 'PROFILE_EXISTS');

    const worker = await Worker.create({
      userId: req.user.id,
      ...req.body
    });

    // Update user role
    await User.findByIdAndUpdate(req.user.id, { role: 'worker' });

    sendResponse(res, 201, 'Worker registered successfully', { worker });
  } catch (error) {
    next(error);
  }
};

exports.getNearbyWorkers = async (req, res, next) => {
  try {
    const { lat, lng, radius = 10, service, sortBy } = req.query;
    
    if (!lat || !lng) throw new ApiError(400, 'Latitude and longitude are required', 'MISSING_COORDS');

    const query = {
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radius) * 1000 // Convert km to meters
        }
      },
      isApproved: true,
      availability: true
    };

    if (service) query.skills = { $in: [service] };

    const workers = await Worker.find(query).populate('userId', 'name avatar phone').lean();
    
    // Simulate distance/eta mapping
    const result = workers.map(worker => ({
      worker,
      distance: '2.5 km', // Placeholder, ideal to use geoNear aggregation for real distance
      eta: '10 mins'
    }));

    if (sortBy === 'rating') {
      result.sort((a, b) => b.worker.stats.avgRating - a.worker.stats.avgRating);
    }

    sendResponse(res, 200, 'Nearby workers found', result);
  } catch (error) {
    next(error);
  }
};

exports.getAllWorkers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, service, city, minRating, available } = req.query;
    
    let query = { isApproved: true };
    if (service) query.skills = { $in: [service] };
    if (available === 'true') query.availability = true;
    if (minRating) query['stats.avgRating'] = { $gte: parseFloat(minRating) };

    const skip = (page - 1) * limit;
    
    const workers = await Worker.find(query)
      .populate('userId', 'name avatar address')
      .skip(skip)
      .limit(parseInt(limit));
      
    const total = await Worker.countDocuments(query);

    sendResponse(res, 200, 'Workers retrieved', workers, {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};

exports.getWorkerById = async (req, res, next) => {
  try {
    const worker = await Worker.findById(req.params.id).populate('userId', 'name avatar phone');
    if (!worker) throw new ApiError(404, 'Worker not found', 'NOT_FOUND');

    sendResponse(res, 200, 'Worker retrieved', { worker });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const worker = await Worker.findOneAndUpdate(
      { userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!worker) throw new ApiError(404, 'Worker profile not found', 'NOT_FOUND');
    sendResponse(res, 200, 'Profile updated', { worker });
  } catch (error) {
    next(error);
  }
};

exports.updateAvailability = async (req, res, next) => {
  try {
    const worker = await Worker.findOneAndUpdate(
      { userId: req.user.id },
      { availability: req.body.availability },
      { new: true }
    );
    sendResponse(res, 200, 'Availability updated', { worker });
  } catch (error) {
    next(error);
  }
};

exports.updateLocation = async (req, res, next) => {
  try {
    const { lat, lng } = req.body;
    const worker = await Worker.findOneAndUpdate(
      { userId: req.user.id },
      { location: { type: 'Point', coordinates: [lng, lat] }, lastSeen: new Date() },
      { new: true }
    );
    
    const { getIo } = require('../config/socket');
    getIo().emit('worker:location:update', { workerId: req.user.id, lat, lng });

    sendResponse(res, 200, 'Location updated', { worker });
  } catch (error) {
    next(error);
  }
};

exports.uploadDocuments = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) throw new ApiError(400, 'No files uploaded', 'FILE_MISSING');
    
    const cloudinary = require('../config/cloudinary');
    const documents = [];
    
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, { folder: 'fixnow_documents' });
      documents.push({ type: 'document', url: result.secure_url, isVerified: false });
      require('fs').unlinkSync(file.path);
    }

    const worker = await Worker.findOneAndUpdate(
      { userId: req.user.id },
      { $push: { documents: { $each: documents } } },
      { new: true }
    );

    sendResponse(res, 200, 'Documents uploaded', { worker });
  } catch (error) {
    next(error);
  }
};

exports.getMyBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const worker = await Worker.findOne({ userId: req.user.id });
    
    let query = { workerId: worker._id };
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const bookings = await Booking.find(query)
      .populate('userId', 'name avatar address phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    sendResponse(res, 200, 'Bookings retrieved', bookings, {
      page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};

exports.getEarnings = async (req, res, next) => {
  try {
    const worker = await Worker.findOne({ userId: req.user.id });
    
    const completedBookings = await Booking.find({ workerId: worker._id, status: 'completed' });
    
    const total = completedBookings.reduce((sum, b) => sum + (b.finalCost || 0), 0);
    // Further aggregation logic for today, thisWeek, thisMonth goes here
    
    sendResponse(res, 200, 'Earnings fetched', { total, count: completedBookings.length });
  } catch (error) {
    next(error);
  }
};
