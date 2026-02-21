// validators/contentValidator.js — express-validator rules for content/category endpoints
const { body, query } = require('express-validator');

const createCategoryValidator = [
    body('name')
        .trim()
        .notEmpty().withMessage('Category name is required')
        .isLength({ max: 50 }).withMessage('Category name cannot exceed 50 characters'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage('Description cannot exceed 200 characters'),
];

const createContentValidator = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ max: 120 }).withMessage('Title cannot exceed 120 characters'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),

    body('category')
        .notEmpty().withMessage('Category ID is required')
        .isMongoId().withMessage('Invalid category ID'),

    body('tags')
        .optional()
        .isArray().withMessage('Tags must be an array'),
];

const searchValidator = [
    query('q')
        .trim()
        .notEmpty().withMessage('Search query (q) is required')
        .isLength({ min: 2 }).withMessage('Query must be at least 2 characters'),
];

module.exports = { createCategoryValidator, createContentValidator, searchValidator };
