// middleware/errorHandler.js — Centralized Express error handler
const ApiError = require('../utils/ApiError');
const config = require('../config/config');

const errorHandler = (err, req, res, _next) => {
    let error = err;

    // Convert non-ApiError to ApiError
    if (!(error instanceof ApiError)) {
        const statusCode =
            error.statusCode ||
            (error.name === 'CastError' ? 400 : 500);
        const message = error.message || 'Internal Server Error';
        error = new ApiError(statusCode, message, error?.errors || [], err.stack);
    }

    // Handle specific Mongoose errors
    if (err.name === 'CastError') {
        error = new ApiError(400, `Invalid ${err.path}: ${err.value}`);
    }
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || 'field';
        error = new ApiError(409, `Duplicate value for '${field}'. Please use another.`);
    }
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((e) => e.message);
        error = new ApiError(400, messages.join('. '));
    }

    const response = {
        success: false,
        statusCode: error.statusCode,
        message: error.message,
        ...(error.errors?.length && { errors: error.errors }),
        ...(config.env === 'development' && { stack: error.stack }),
    };

    res.status(error.statusCode).json(response);
};

module.exports = errorHandler;
