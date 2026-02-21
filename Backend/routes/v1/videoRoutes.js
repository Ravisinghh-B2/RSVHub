// routes/v1/videoRoutes.js — Versioned video routes
const router = require('express').Router();
const {
    getVideos, searchVideos, getByCategory,
    getVideo, createVideo, getCategories,
} = require('../../controllers/videoController');
const { verifyJWT } = require('../../middleware/auth');
const { body } = require('express-validator');

const createVideoValidator = [
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 120 }),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('thumbnailUrl').trim().notEmpty().withMessage('Thumbnail URL is required').isURL(),
    body('videoUrl').trim().notEmpty().withMessage('Video URL is required'),
];

// IMPORTANT: specific routes BEFORE /:id to avoid conflicts
router.get('/search', searchVideos);
router.get('/categories/list', getCategories);
router.get('/category/:name', getByCategory);
router.get('/', getVideos);
router.get('/:id', getVideo);
router.post('/', verifyJWT, createVideoValidator, createVideo);

module.exports = router;
