// app.js — Express application factory (all middleware + routes + static files)
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');

const config = require('./config/config');
const routes = require('./routes/index');
const { sanitizeNoSQL, sanitizeXSS } = require('./middleware/sanitize');
const { apiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const ApiError = require('./utils/ApiError');

const app = express();

// ───────────────────────────────────────────────
// 1. Security Headers (relaxed for YouTube embeds + images)
// ───────────────────────────────────────────────
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                fontSrc: ["'self'", "https://fonts.gstatic.com"],
                imgSrc: ["'self'", "data:", "https:", "http:"],
                frameSrc: ["'self'", "https://www.youtube.com", "https://youtube.com"],
                connectSrc: ["'self'", "http://localhost:5000"],
            },
        },
        crossOriginEmbedderPolicy: false,
    })
);

// ───────────────────────────────────────────────
// 2. CORS (allow all origins in dev for flexibility)
// ───────────────────────────────────────────────
app.use(
    cors({
        origin: true,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

// ───────────────────────────────────────────────
// 3. Body Parsing + Compression
// ───────────────────────────────────────────────
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(compression());

// ───────────────────────────────────────────────
// 4. Logging
// ───────────────────────────────────────────────
if (config.env !== 'test') {
    app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));
}

// ───────────────────────────────────────────────
// 5. Input Sanitization
// ───────────────────────────────────────────────
app.use(sanitizeNoSQL);
app.use(sanitizeXSS);

// ───────────────────────────────────────────────
// 6. Global Rate Limiter (API only)
// ───────────────────────────────────────────────
app.use('/api', apiLimiter);

// ───────────────────────────────────────────────
// 7. API Routes
// ───────────────────────────────────────────────
app.use('/api', routes);

// ───────────────────────────────────────────────
// 8. Serve Frontend Static Files
//    Project root = c:\web\RSV (one level above Backend/)
// ───────────────────────────────────────────────
const projectRoot = path.join(__dirname, '..');
app.use(express.static(projectRoot));

// Serve index.html for the root URL
app.get('/', (_req, res) => {
    res.sendFile(path.join(projectRoot, 'index.html'));
});

// ───────────────────────────────────────────────
// 9. 404 for unmatched API routes only
// ───────────────────────────────────────────────
app.use('/api/*', (req, _res, next) => {
    next(new ApiError(404, `API route not found: ${req.originalUrl}`));
});

// ───────────────────────────────────────────────
// 10. Centralized Error Handling (must be last)
// ───────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;

