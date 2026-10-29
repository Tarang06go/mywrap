const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/wrapchik');

    console.log(`[MongoDB] Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Error] Connection Failed: ${error.message}`);
    // Non-fatal fallback for development offline environment
    console.log('[MongoDB] Running in memory / offline mode fallback warning');
  }
};

module.exports = connectDB;
