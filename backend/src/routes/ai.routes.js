const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth.middleware');
const { aiLimiter } = require('../middleware/rateLimiter.middleware');

router.use(protect);
router.use(aiLimiter);

router.post('/analyze', aiController.analyzeProblem);
router.post('/chat', aiController.chat);

module.exports = router;
