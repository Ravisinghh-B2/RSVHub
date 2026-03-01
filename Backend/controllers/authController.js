// controllers/authController.js — Register, Login, Refresh, Profile
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const config = require('../config/config');

// Helper: collect validator errors
const checkValidation = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new ApiError(422, 'Validation failed', errors.array());
    }
};

// POST /api/v1/auth/register
const register = asyncHandler(async (req, res) => {
    checkValidation(req);
    const { username, email, password } = req.body;

    // Check duplicates
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
        const field = existingUser.email === email ? 'Email' : 'Username';
        throw new ApiError(409, `${field} already in use`);
    }

    const user = await User.create({ username, email, password });

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save hashed refresh token
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const userData = {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        theme: user.theme,
        createdAt: user.createdAt,
    };

    res
        .status(201)
        .json(new ApiResponse(201, { user: userData, accessToken, refreshToken }, 'User registered successfully'));
});

// POST /api/v1/auth/login
const login = asyncHandler(async (req, res) => {
    checkValidation(req);
    const { email, password } = req.body;

    // Explicitly select password since schema has select:false
    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (!user) {
        throw new ApiError(401, 'Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new ApiError(401, 'Invalid email or password');
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const userData = {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        theme: user.theme,
    };

    res
        .status(200)
        .json(new ApiResponse(200, { user: userData, accessToken, refreshToken }, 'Login successful'));
});

// POST /api/v1/auth/refresh
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(400, 'Refresh token is required');
    }

    let decoded;
    try {
        decoded = jwt.verify(incomingRefreshToken, config.jwt.refreshSecret);
    } catch {
        throw new ApiError(401, 'Invalid or expired refresh token');
    }

    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== incomingRefreshToken) {
        throw new ApiError(401, 'Refresh token mismatch or revoked');
    }

    const newAccessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    res
        .status(200)
        .json(new ApiResponse(200, { accessToken: newAccessToken, refreshToken: newRefreshToken }, 'Token refreshed'));
});

// POST /api/v1/auth/logout
const logout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    res.status(200).json(new ApiResponse(200, {}, 'Logged out successfully'));
});

// GET /api/v1/auth/profile  (Protected)
const getProfile = asyncHandler(async (req, res) => {
    res.status(200).json(new ApiResponse(200, req.user, 'Profile fetched'));
});

module.exports = { register, login, refreshAccessToken, logout, getProfile };
