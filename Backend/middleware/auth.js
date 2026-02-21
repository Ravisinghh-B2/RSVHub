// middleware/auth.js — JWT verification middleware for protected routes
const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const config = require('../config/config');

const verifyJWT = asyncHandler(async (req, _res, next) => {
    // Accept token from: Authorization header OR cookie
    const authHeader = req.headers.authorization;
    const token =
        (authHeader && authHeader.startsWith('Bearer ')
            ? authHeader.split(' ')[1]
            : null) || req.cookies?.accessToken;

    if (!token) {
        throw new ApiError(401, 'Unauthorized: No token provided');
    }

    let decoded;
    try {
        decoded = jwt.verify(token, config.jwt.secret);
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            throw new ApiError(401, 'Token expired. Please log in again.');
        }
        throw new ApiError(401, 'Invalid token');
    }

    const user = await User.findById(decoded.id).select('-password -refreshToken');
    if (!user) {
        throw new ApiError(401, 'Token user no longer exists');
    }

    req.user = user;
    next();
});

// Admin-only guard (used AFTER verifyJWT)
const requireAdmin = asyncHandler(async (req, _res, next) => {
    if (req.user.role !== 'admin') {
        throw new ApiError(403, 'Forbidden: Admin access required');
    }
    next();
});

module.exports = { verifyJWT, requireAdmin };
