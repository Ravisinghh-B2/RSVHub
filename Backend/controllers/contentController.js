// controllers/contentController.js — Paginated listing, full-text search, and creation
const { validationResult } = require('express-validator');
const Content = require('../models/Content');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const checkValidation = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new ApiError(422, 'Validation failed', errors.array());
};

// GET /api/v1/content?page=1&limit=20&category=<id>
const getContent = asyncHandler(async (req, res) => {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const skip = (page - 1) * limit;

    const filter = { isPublished: true };
    if (req.query.category) {
        filter.category = req.query.category;
    }

    const [content, total] = await Promise.all([
        Content.find(filter)
            .populate('category', 'name slug')       // Join only needed fields
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Content.countDocuments(filter),
    ]);

    res.status(200).json(
        new ApiResponse(200, {
            content,
            pagination: { total, page, limit, pages: Math.ceil(total / limit) },
        }, 'Content fetched')
    );
});

// GET /api/v1/content/search?q=keyword&page=1&limit=20
const searchContent = asyncHandler(async (req, res) => {
    checkValidation(req);

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const skip = (page - 1) * limit;
    const { q } = req.query;

    const [content, total] = await Promise.all([
        Content.find(
            { $text: { $search: q }, isPublished: true },
            { score: { $meta: 'textScore' } }          // Include relevance score
        )
            .populate('category', 'name slug')
            .sort({ score: { $meta: 'textScore' } })   // Sort by relevance
            .skip(skip)
            .limit(limit)
            .lean(),
        Content.countDocuments({ $text: { $search: q }, isPublished: true }),
    ]);

    res.status(200).json(
        new ApiResponse(200, {
            content,
            query: q,
            pagination: { total, page, limit, pages: Math.ceil(total / limit) },
        }, `Search results for "${q}"`)
    );
});

// POST /api/v1/content  (Protected)
const createContent = asyncHandler(async (req, res) => {
    checkValidation(req);
    const { title, description, category, tags } = req.body;

    const content = await Content.create({
        title,
        description,
        category,
        tags: tags || [],
        createdBy: req.user._id,
    });

    // Populate category before returning
    await content.populate('category', 'name slug');

    res.status(201).json(new ApiResponse(201, content, 'Content created'));
});

module.exports = { getContent, searchContent, createContent };
