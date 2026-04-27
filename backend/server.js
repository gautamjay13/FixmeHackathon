require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { Server } = require('socket.io');

const connectDB = require('./src/config/db');
const { initSocket } = require('./src/config/socket');
const { apiLimiter } = require('./src/middleware/rateLimiter.middleware');
const errorHandler = require('./src/middleware/errorHandler.middleware');

// Routes
const authRoutes = require('./src/routes/auth.routes');
const workerRoutes = require('./src/routes/worker.routes');
const bookingRoutes = require('./src/routes/booking.routes');
const reviewRoutes = require('./src/routes/review.routes');
const aiRoutes = require('./src/routes/ai.routes');
const invoiceRoutes = require('./src/routes/invoice.routes');
const paymentRoutes = require('./src/routes/payment.routes');
const notificationRoutes = require('./src/routes/notification.routes');
const adminRoutes = require('./src/routes/admin.routes');
const jobsRoutes = require('./src/routes/jobs.routes');
const statsRoutes = require('./src/routes/stats.routes');
const userStatusRoutes = require('./src/routes/userStatus.routes');

const app = express();
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', process.env.FRONTEND_URL],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});

// Initialize DB and Socket
connectDB();
initSocket(io);

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', process.env.FRONTEND_URL],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('dev'));

// Rate Limiting
app.use('/api', apiLimiter);

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/workers', workerRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/invoices', invoiceRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/jobs', jobsRoutes);
app.use('/api/v1/stats', statsRoutes);
app.use('/api/v1/user', userStatusRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({ success: true, message: 'FixNow API is running' });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle Unhandled Promise Rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
