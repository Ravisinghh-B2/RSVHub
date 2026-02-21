// routes/index.js — Root router: aggregates all versioned routes
const router = require('express').Router();

const authRoutes = require('./v1/authRoutes');
const categoryRoutes = require('./v1/categoryRoutes');
const contentRoutes = require('./v1/contentRoutes');
const videoRoutes = require('./v1/videoRoutes');

// Health check
router.get('/health', (_req, res) =>
    res.status(200).json({
        success: true,
        message: 'API is healthy',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
    })
);

// v1 API routes
router.use('/v1/auth', authRoutes);
router.use('/v1/categories', categoryRoutes);
router.use('/v1/content', contentRoutes);
router.use('/v1/videos', videoRoutes);

module.exports = router;

