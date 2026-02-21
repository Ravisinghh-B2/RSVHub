// controllers/videoController.js — List, Get, Search, Category, Create, IncrementViews
const { validationResult } = require('express-validator');
const Video = require('../models/Video');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// ── Helpers ──────────────────────────────────────────────────
const checkValidation = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new ApiError(422, 'Validation failed', errors.array());
};

const getPagination = (query) => {
    const page = Math.max(parseInt(query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(query.limit, 10) || 20, 100);
    return { page, limit, skip: (page - 1) * limit };
};

// ── GET /api/v1/videos  ───────────────────────────────────────
const getVideos = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const filter = { isPublished: true };

    const [videos, total] = await Promise.all([
        Video.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Video.countDocuments(filter),
    ]);

    res.status(200).json(
        new ApiResponse(200, { videos, pagination: { total, page, limit, pages: Math.ceil(total / limit) } }, 'Videos fetched')
    );
});

// ── GET /api/v1/videos/search?q= ────────────────────────────
const searchVideos = asyncHandler(async (req, res) => {
    const { q } = req.query;
    if (!q || q.trim().length < 2) throw new ApiError(400, 'Query (q) must be at least 2 characters');

    const { page, limit, skip } = getPagination(req.query);

    const [videos, total] = await Promise.all([
        Video.find(
            { $text: { $search: q }, isPublished: true },
            { score: { $meta: 'textScore' } }
        )
            .sort({ score: { $meta: 'textScore' } })
            .skip(skip)
            .limit(limit)
            .lean(),
        Video.countDocuments({ $text: { $search: q }, isPublished: true }),
    ]);

    // Build related: same category as first result, most viewed
    let related = [];
    if (videos.length) {
        related = await Video.find({
            category: videos[0].category,
            isPublished: true,
            _id: { $nin: videos.map((v) => v._id) },
        })
            .sort({ views: -1 })
            .limit(8)
            .lean();
    }

    res.status(200).json(
        new ApiResponse(200, { videos, related, query: q, pagination: { total, page, limit, pages: Math.ceil(total / limit) } }, `Search results for "${q}"`)
    );
});

// ── GET /api/v1/videos/category/:name ───────────────────────
const getByCategory = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const category = req.params.name.toLowerCase();

    const filter = { category, isPublished: true };
    const [videos, total] = await Promise.all([
        Video.find(filter).sort({ views: -1 }).skip(skip).limit(limit).lean(),
        Video.countDocuments(filter),
    ]);

    res.status(200).json(
        new ApiResponse(200, { videos, category, pagination: { total, page, limit, pages: Math.ceil(total / limit) } }, `Videos in "${category}"`)
    );
});

// ── GET /api/v1/videos/:id ───────────────────────────────────
// Increments view count and returns related videos
const getVideo = asyncHandler(async (req, res) => {
    const video = await Video.findByIdAndUpdate(
        req.params.id,
        { $inc: { views: 1 } },
        { new: true, runValidators: false }
    ).lean();

    if (!video) throw new ApiError(404, 'Video not found');

    // Recommendation: same category, exclude current, sorted by views
    const relatedVideos = await Video.find({
        category: video.category,
        isPublished: true,
        _id: { $ne: video._id },
    })
        .sort({ views: -1 })
        .limit(10)
        .lean();

    res.status(200).json(
        new ApiResponse(200, { video, relatedVideos }, 'Video fetched')
    );
});

// ── POST /api/v1/videos  (Protected) ─────────────────────────
const createVideo = asyncHandler(async (req, res) => {
    checkValidation(req);
    const { title, description, category, thumbnailUrl, videoUrl, duration, tags } = req.body;

    const video = await Video.create({
        title, description, category: category.toLowerCase(),
        thumbnailUrl, videoUrl, duration: duration || '0:00',
        tags: tags || [], uploadedBy: req.user._id,
    });

    res.status(201).json(new ApiResponse(201, video, 'Video created'));
});

// ── GET /api/v1/videos/categories/list ──────────────────────
const getCategories = asyncHandler(async (_req, res) => {
    const categories = await Video.distinct('category', { isPublished: true });
    res.status(200).json(new ApiResponse(200, { categories: categories.sort() }, 'Categories fetched'));
});

module.exports = { getVideos, searchVideos, getByCategory, getVideo, createVideo, getCategories };
