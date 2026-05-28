const mongoose = require('mongoose');

let _memServer = null;

const connectDB = async () => {
  // Accept both MONGODB_URI and MONGODB_URL (common naming variations)
  let uri = process.env.MONGODB_URI || process.env.MONGODB_URL;

  // Try real MongoDB first; fall back to in-memory server
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    return;
  } catch (_) {
    console.log('Real MongoDB not available — starting in-memory server...');
  }

  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    _memServer = await MongoMemoryServer.create();
    uri = _memServer.getUri();
    process.env.MONGODB_URI = uri;
    const conn = await mongoose.connect(uri);
    console.log(`In-Memory MongoDB started: ${conn.connection.host}`);
    // Seed automatically when using in-memory DB
    setTimeout(() => require('../seed/seedData').runSeed(), 500);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;