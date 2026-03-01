const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/v1/theme
const updateTheme = asyncHandler(async (req, res) => {
    const { theme } = req.body;
    const allowedThemes = ['serika-dark', 'carbon', 'dracula', 'night-runner', 'terminal'];

    if (!theme || !allowedThemes.includes(theme)) {
        throw new ApiError(400, 'Invalid theme selection');
    }

    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    user.theme = theme;
    await user.save({ validateBeforeSave: false });

    res.status(200).json(new ApiResponse(200, { theme: user.theme }, 'Theme updated successfully'));
});

// GET /api/v1/theme
const getTheme = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    res.status(200).json(new ApiResponse(200, { theme: user.theme }, 'Theme fetched successfully'));
});

module.exports = { updateTheme, getTheme };
