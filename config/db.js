const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI); //atlas connection string
    console.log('MongoDB Atlas connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;

/*
  WHAT THIS FILE DOES AND WHY:
  - Exports a single async function that connects Mongoose to MongoDB Atlas.
  - Called once at server startup (server.js). If the connection fails the process
    exits immediately so the app never runs in a broken state.
*/
