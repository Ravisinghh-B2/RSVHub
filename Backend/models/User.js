// models/User.js — User schema with password hashing and JWT methods
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Username is required'],
            unique: true,
            trim: true,
            minlength: [3, 'Username must be at least 3 characters'],
            maxlength: [30, 'Username cannot exceed 30 characters'],
            lowercase: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters'],
            select: false, // Never returned in queries by default
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        refreshToken: {
            type: String,
            select: false,
        },
        theme: {
            type: String,
            enum: ['serika-dark', 'carbon', 'dracula', 'night-runner', 'terminal'],
            default: 'serika-dark',
        },
    },
    { timestamps: true }
);

// --- Indexes ---
// email and username already indexed via unique: true

// --- Pre-save: hash password ---
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, config.bcryptSaltRounds);
    next();
});

// --- Instance methods ---
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        { id: this._id, username: this.username, role: this.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        { id: this._id },
        config.jwt.refreshSecret,
        { expiresIn: config.jwt.refreshExpiresIn }
    );
};

module.exports = mongoose.model('User', userSchema);
