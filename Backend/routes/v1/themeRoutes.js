const express = require('express');
const router = express.Router();
const themeController = require('../../controllers/themeController');
const { verifyJWT } = require('../../middleware/auth');

// All theme routes are protected
router.use(verifyJWT);

router.post('/', themeController.updateTheme);
router.get('/', themeController.getTheme);

module.exports = router;
