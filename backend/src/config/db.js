const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (mongoUri) {
      await mongoose.connect(mongoUri, {
        autoIndex: true, // Make sure indexes are built
      });
      console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    } else {
      console.log('No MONGO_URI provided in environment, falling back to in-memory database');
      mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      
      await mongoose.connect(uri, {
        autoIndex: true,
      });
      console.log(`MongoDB Connected to in-memory database: ${uri}`);
    }
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
