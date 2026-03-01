// routes/index.js — Root router: aggregates all versioned routes
const router = require('express').Router();

const authRoutes = require('./v1/authRoutes');
const categoryRoutes = require('./v1/categoryRoutes');
const contentRoutes = require('./v1/contentRoutes');
const videoRoutes = require('./v1/videoRoutes');
const themeRoutes = require('./v1/themeRoutes');

// Base API message
router.get('/', (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to the RSV API',
        version: '1.0.0',
    });
});

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
router.use('/v1/theme', themeRoutes);

module.exports = router;

