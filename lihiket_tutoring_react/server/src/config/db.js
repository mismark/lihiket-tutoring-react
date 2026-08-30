const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Connection pool — keep 10 connections ready for concurrent requests
      maxPoolSize:     10,
      minPoolSize:     2,
      // Timeout settings for reliability
      serverSelectionTimeoutMS: 5000,  // fail fast if MongoDB unreachable
      socketTimeoutMS:          45000,
      connectTimeoutMS:         10000,
      // Heartbeat keeps the connection alive
      heartbeatFrequencyMS:     10000,
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);

    // Graceful shutdown on app close
    process.on('SIGINT',  () => { mongoose.connection.close(); process.exit(0); });
    process.on('SIGTERM', () => { mongoose.connection.close(); process.exit(0); });

  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
