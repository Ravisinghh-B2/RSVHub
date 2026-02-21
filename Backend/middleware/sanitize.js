// middleware/sanitize.js — Input sanitization middleware stack
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

// Prevent NoSQL injection by removing $ and . from user inputs
const sanitizeNoSQL = mongoSanitize({
    replaceWith: '_',
    allowDots: false,
});

// Strip HTML tags to prevent XSS
const sanitizeXSS = xss();

module.exports = { sanitizeNoSQL, sanitizeXSS };
