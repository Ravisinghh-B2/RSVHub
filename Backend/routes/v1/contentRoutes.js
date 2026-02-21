// routes/v1/contentRoutes.js — Versioned content routes
const router = require('express').Router();
const { getContent, searchContent, createContent } = require('../../controllers/contentController');
const { verifyJWT } = require('../../middleware/auth');
const { createContentValidator, searchValidator } = require('../../validators/contentValidator');

// Order matters: /search must come before /:id to avoid route conflicts
router.get('/search', searchValidator, searchContent);
router.get('/', getContent);
router.post('/', verifyJWT, createContentValidator, createContent);

module.exports = router;
