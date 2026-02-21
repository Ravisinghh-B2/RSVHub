// server.js — Entry point: connects DB, starts server, handles graceful shutdown
require('dotenv').config();
const app = require('./app');
const { connectDB, disconnectDB } = require('./config/db');
const config = require('./config/config');

// Validate critical environment variables on startup
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
requiredEnvVars.forEach((key) => {
    if (!process.env[key]) {
        console.error(`❌ Missing required environment variable: ${key}`);
        process.exit(1);
    }
});

let server;

const startServer = async () => {
    await connectDB();

    server = app.listen(config.port, () => {
        console.log(`🚀 Server running in ${config.env} mode on port ${config.port}`);
        console.log(`📡 API Base: http://localhost:${config.port}/api`);
        console.log(`🏥 Health:   http://localhost:${config.port}/api/health`);
    });
};

// ───────────────────────────────────────────────
// Graceful Shutdown
// ───────────────────────────────────────────────
const shutdown = async (signal) => {
    console.log(`\n⚠️  ${signal} received. Shutting down gracefully...`);
    if (server) {
        server.close(async () => {
            await disconnectDB();
            console.log('✅ Process terminated cleanly');
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('💥 Unhandled Rejection:', err.message);
    shutdown('UnhandledRejection');
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('💥 Uncaught Exception:', err.message);
    process.exit(1); // Mandatory crash for uncaught exceptions
});

startServer();
