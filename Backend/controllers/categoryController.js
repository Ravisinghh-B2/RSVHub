// controllers/categoryController.js — CRUD for categories
const { validationResult } = require('express-validator');
const Category = require('../models/Category');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const checkValidation = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new ApiError(422, 'Validation failed', errors.array());
};

// GET /api/v1/categories
const getCategories = asyncHandler(async (req, res) => {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const skip = (page - 1) * limit;

    const [categories, total] = await Promise.all([
        Category.find({ isActive: true })
            .sort({ name: 1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Category.countDocuments({ isActive: true }),
    ]);

    res.status(200).json(
        new ApiResponse(200, {
            categories,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        }, 'Categories fetched')
    );
});

// POST /api/v1/categories  (Protected)
const createCategory = asyncHandler(async (req, res) => {
    checkValidation(req);
    const { name, description } = req.body;

    const existing = await Category.findOne({
        name: { $regex: `^${name}$`, $options: 'i' },
    });
    if (existing) {
        throw new ApiError(409, 'Category with this name already exists');
    }

    const category = await Category.create({ name, description });
    res.status(201).json(new ApiResponse(201, category, 'Category created'));
});

module.exports = { getCategories, createCategory };
