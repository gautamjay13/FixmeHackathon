const express = require('express');
const router = express.Router();
const workerController = require('../controllers/worker.controller');
const validate = require('../middleware/validate.middleware');
const { registerWorkerSchema, updateProfileSchema, locationSchema } = require('../validators/worker.validator');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/nearby', workerController.getNearbyWorkers);
router.get('/', workerController.getAllWorkers);
router.get('/:id', workerController.getWorkerById);

// Protected routes
router.use(protect);

router.post('/register', validate(registerWorkerSchema), workerController.registerWorker);

router.patch('/profile', restrictTo('worker'), validate(updateProfileSchema), workerController.updateProfile);
router.patch('/availability', restrictTo('worker'), workerController.updateAvailability);
router.patch('/location', restrictTo('worker'), validate(locationSchema), workerController.updateLocation);
router.post('/upload-documents', restrictTo('worker'), upload.array('documents', 5), workerController.uploadDocuments);
router.get('/my/bookings', restrictTo('worker'), workerController.getMyBookings);
router.get('/my/earnings', restrictTo('worker'), workerController.getEarnings);

module.exports = router;
