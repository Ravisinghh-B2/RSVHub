// routes/v1/categoryRoutes.js — Versioned category routes
const router = require('express').Router();
const { getCategories, createCategory } = require('../../controllers/categoryController');
const { verifyJWT } = require('../../middleware/auth');
const { createCategoryValidator } = require('../../validators/contentValidator');

router.get('/', getCategories);
router.post('/', verifyJWT, createCategoryValidator, createCategory);

module.exports = router;
