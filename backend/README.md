# FixNow Backend API

This is the production-ready Node.js backend for the FixNow on-demand home services platform.

## Features
- Complete Authentication (JWT Access & Refresh tokens)
- Role-based Access Control (User, Worker, Admin)
- Live Location Tracking (Socket.io + MongoDB GeoJSON)
- Real-time Notifications & Booking Updates
- AI Problem Analyzer (OpenAI GPT-4o-mini)
- PDF Invoice Generation (PDFKit)
- Payments Integration (Razorpay)
- Image/Document Uploads (Cloudinary)
- Automated Email Service (Nodemailer)

## Tech Stack
- **Runtime:** Node.js 20+ LTS
- **Framework:** Express.js 4.x
- **Database:** MongoDB + Mongoose 7.x
- **Security:** Helmet, express-rate-limit, bcryptjs
- **Validation:** Zod
- **Process Manager:** PM2

## Local Setup Guide

1. **Clone the repository and navigate to the backend folder:**
   \`\`\`bash
   cd backend
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Environment Configuration:**
   Copy the example environment file and fill in your credentials.
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   *Required credentials include MongoDB URI, JWT Secrets, Cloudinary keys, OpenAI key, Razorpay keys, and Gmail SMTP details.*

4. **Start the development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Start in production mode (PM2):**
   \`\`\`bash
   npm run prod
   \`\`\`

## API Documentation

### Base URL
\`http://localhost:5000/api/v1\`

### Standardization
All responses follow this format:
\`\`\`json
{
  "success": true,
  "message": "Success message",
  "data": { ... },
  "meta": { "page": 1, "total": 10 }
}
\`\`\`

### Endpoints (Brief Overview)
- **Auth:** \`/auth/register\`, \`/auth/login\`, \`/auth/refresh-token\`, \`/auth/logout\`
- **Workers:** \`/workers/nearby\`, \`/workers/:id\`, \`/workers/profile\`
- **Bookings:** \`/bookings\`, \`/bookings/:id/status\`, \`/bookings/:id/complete\`
- **Reviews:** \`/reviews/worker/:workerId\`, \`/reviews/booking/:bookingId\`
- **AI:** \`/ai/analyze\`, \`/ai/chat\`
- **Invoices:** \`/invoices/my-invoices\`, \`/invoices/booking/:id/pdf\`
- **Payments:** \`/payments/create-order\`, \`/payments/verify\`

## Frontend Integration

Example of creating a booking from React:
\`\`\`javascript
const response = await axios.post(
  'http://localhost:5000/api/v1/bookings',
  { 
    serviceType: 'plumber', 
    problemTitle: 'Leaky Pipe',
    problemDescription: 'Under the sink', 
    coordinates: { lat: 28.7, lng: 77.1 }, 
    isEmergency: true 
  },
  { 
    headers: { Authorization: \`Bearer \${accessToken}\` }, 
    withCredentials: true 
  }
);
\`\`\`

Example of connecting to Socket.io:
\`\`\`javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  transports: ['websocket'],
  reconnection: true,
});

socket.on('connect', () => {
  socket.emit('authenticate', { token: \`Bearer \${accessToken}\` });
});

socket.on('worker:location:update', (data) => {
  console.log('Worker is at:', data.lat, data.lng);
});
\`\`\`

## Deployment
Use the included \`ecosystem.config.js\` to run the app with PM2.
For platforms like Render or Railway, simply specify the build command as \`npm install\` and the start command as \`npm start\`. Make sure to set all the environment variables in the platform dashboard.
