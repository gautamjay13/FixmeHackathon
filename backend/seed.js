/**
 * seed.js — Populates the database with a test provider user and sample jobs.
 * Usage: node seed.js
 * (Reads MONGO_URI from backend/.env, or uses in-memory if not set)
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { MongoMemoryServer } = require('mongodb-memory-server');

// ─── Models ──────────────────────────────────────────────────────────────────
const User = require('./src/models/User.model');
const Job = require('./src/models/Job.model');

const PROVIDER_EMAIL = 'plumber@fixnow.dev';
const PROVIDER_PASSWORD = 'password123';

async function connectDB() {
  const mongoUri = process.env.MONGO_URI;
  if (mongoUri) {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB:', mongoUri);
  } else {
    // For in-memory DB (mainly for quick local testing without Atlas)
    console.warn('No MONGO_URI set — using in-memory DB. Data will not persist after script exits.');
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  }
}

async function seed() {
  await connectDB();

  // ── Clear existing data ───────────────────────────────────────────────────
  await Job.deleteMany({});
  console.log('Cleared existing jobs.');

  // ── Upsert provider user ──────────────────────────────────────────────────
  let provider = await User.findOne({ email: PROVIDER_EMAIL }).select('+password');
  if (!provider) {
    provider = await User.create({
      name: 'Ravi Kumar',
      email: PROVIDER_EMAIL,
      phone: '9876543210',
      password: PROVIDER_PASSWORD,  // hashed by pre-save hook
      role: 'plumber',
      isOnline: true,
      weeklyGoal: { jobTarget: 25, earningsTarget: 15000 },
    });
    console.log('Created provider user:', PROVIDER_EMAIL);
  } else {
    // Ensure weeklyGoal fields exist on existing user
    provider.isOnline = true;
    provider.weeklyGoal = { jobTarget: 25, earningsTarget: 15000 };
    await provider.save({ validateBeforeSave: false });
    console.log('Updated existing provider user:', PROVIDER_EMAIL);
  }

  const userId = provider._id;

  // ── 5 Pending jobs ────────────────────────────────────────────────────────
  const pendingJobs = [
    {
      customerId: userId,
      customerName: 'Priya Sharma',
      serviceType: 'Emergency Leak Repair',
      address: '123 MG Road, Bangalore',
      scheduledTime: '2:30 PM Today',
      distanceKm: 1.2,
      price: 650,
      status: 'pending',
    },
    {
      customerId: userId,
      customerName: 'Rahul Verma',
      serviceType: 'AC Installation',
      address: '456 Park Street, Mumbai',
      scheduledTime: '4:00 PM Today',
      distanceKm: 2.5,
      price: 1200,
      status: 'pending',
    },
    {
      customerId: userId,
      customerName: 'Sunita Rao',
      serviceType: 'Pipe Replacement',
      address: '78 Jubilee Hills, Hyderabad',
      scheduledTime: '10:00 AM Tomorrow',
      distanceKm: 3.8,
      price: 850,
      status: 'pending',
    },
    {
      customerId: userId,
      customerName: 'Arun Mehta',
      serviceType: 'Water Heater Repair',
      address: '22 Connaught Place, Delhi',
      scheduledTime: '3:30 PM Tomorrow',
      distanceKm: 0.9,
      price: 500,
      status: 'pending',
    },
    {
      customerId: userId,
      customerName: 'Kavitha Nair',
      serviceType: 'Bathroom Fitting',
      address: '5 Anna Nagar, Chennai',
      scheduledTime: '9:00 AM Day After',
      distanceKm: 4.2,
      price: 1500,
      status: 'pending',
    },
  ];

  // ── 3 Completed jobs (this week, so they count toward weekly stats) ────────
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + diffToMonday);
  weekStart.setHours(8, 0, 0, 0);

  const completedJobs = [
    {
      customerId: userId,
      customerName: 'Anita Desai',
      serviceType: 'Electrical Wiring',
      address: '789 Lake View, Delhi',
      scheduledTime: 'Completed',
      distanceKm: 3.1,
      price: 450,
      status: 'completed',
      acceptedAt: new Date(weekStart.getTime() + 1 * 60 * 60 * 1000),
      completedAt: new Date(weekStart.getTime() + 3 * 60 * 60 * 1000),
    },
    {
      customerId: userId,
      customerName: 'Deepak Singh',
      serviceType: 'Geyser Installation',
      address: '10 Brigade Road, Bangalore',
      scheduledTime: 'Completed',
      distanceKm: 2.0,
      price: 700,
      status: 'completed',
      acceptedAt: new Date(weekStart.getTime() + 25 * 60 * 60 * 1000),
      completedAt: new Date(weekStart.getTime() + 27 * 60 * 60 * 1000),
    },
    {
      customerId: userId,
      customerName: 'Meera Pillai',
      serviceType: 'Tap Repair',
      address: '33 Marine Lines, Mumbai',
      scheduledTime: 'Completed',
      distanceKm: 1.5,
      price: 300,
      status: 'completed',
      acceptedAt: new Date(weekStart.getTime() + 49 * 60 * 60 * 1000),
      completedAt: new Date(weekStart.getTime() + 50 * 60 * 60 * 1000),
    },
  ];

  await Job.insertMany([...pendingJobs, ...completedJobs]);
  console.log(`Inserted ${pendingJobs.length} pending jobs + ${completedJobs.length} completed jobs.`);

  console.log('\n✅ Seed complete!');
  console.log('─────────────────────────────────────────');
  console.log('Provider login credentials:');
  console.log('  Email   :', PROVIDER_EMAIL);
  console.log('  Password:', PROVIDER_PASSWORD);
  console.log('─────────────────────────────────────────\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
