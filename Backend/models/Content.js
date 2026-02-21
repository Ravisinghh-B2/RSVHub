// models/Content.js — Content schema linked to Category
const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            maxlength: [120, 'Title cannot exceed 120 characters'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [1000, 'Description cannot exceed 1000 characters'],
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'Category is required'],
        },
        tags: [{ type: String, trim: true, lowercase: true }],
        isPublished: {
            type: Boolean,
            default: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    { timestamps: true }
);

// --- Indexes ---
contentSchema.index({ category: 1 });
contentSchema.index({ title: 'text', description: 'text' }); // Full-text search
contentSchema.index({ isPublished: 1, createdAt: -1 });      // Pagination filter

module.exports = mongoose.model('Content', contentSchema);
