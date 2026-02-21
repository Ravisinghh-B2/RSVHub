// routes/v1/authRoutes.js — Versioned auth routes
const router = require('express').Router();
const { register, login, refreshAccessToken, logout, getProfile } = require('../../controllers/authController');
const { verifyJWT } = require('../../middleware/auth');
const { authLimiter } = require('../../middleware/rateLimiter');
const { registerValidator, loginValidator } = require('../../validators/authValidator');

router.post('/register', authLimiter, registerValidator, register);
router.post('/login', authLimiter, loginValidator, login);
router.post('/refresh', authLimiter, refreshAccessToken);
router.post('/logout', verifyJWT, logout);
router.get('/profile', verifyJWT, getProfile);

module.exports = router;
