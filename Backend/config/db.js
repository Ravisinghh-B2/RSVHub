// config/db.js — MongoDB connection with graceful shutdown
const mongoose = require('mongoose');
const config = require('./config');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(config.mongoUri, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

// Graceful shutdown
const disconnectDB = async () => {
    await mongoose.connection.close();
    console.log('🔌 MongoDB disconnected');
};

module.exports = { connectDB, disconnectDB };
