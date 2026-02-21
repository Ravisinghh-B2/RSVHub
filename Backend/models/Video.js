// models/Video.js — Video schema with text search + category indexes
const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Video title is required'],
            trim: true,
            maxlength: [120, 'Title cannot exceed 120 characters'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [2000, 'Description cannot exceed 2000 characters'],
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            trim: true,
            lowercase: true,
        },
        thumbnailUrl: {
            type: String,
            required: [true, 'Thumbnail URL is required'],
            trim: true,
        },
        videoUrl: {
            type: String,
            required: [true, 'Video URL is required'],
            trim: true,
        },
        views: {
            type: Number,
            default: 0,
            min: 0,
        },
        duration: {
            type: String, // e.g. "12:34"
            default: '0:00',
        },
        tags: [{ type: String, trim: true, lowercase: true }],
        isPublished: {
            type: Boolean,
            default: true,
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    { timestamps: true }
);

// ── Indexes ──────────────────────────────────────────────────
videoSchema.index({ title: 'text', description: 'text' }); // Full-text search
videoSchema.index({ category: 1 });                         // Category filter
videoSchema.index({ views: -1 });                           // Top videos
videoSchema.index({ isPublished: 1, createdAt: -1 });       // Pagination

module.exports = mongoose.model('Video', videoSchema);
