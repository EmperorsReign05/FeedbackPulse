import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import config from './config';
import {
    authRoutes,
    projectRoutes,
    feedbackRoutes,
    publicRoutes,
    widgetRoutes
} from './routes';
import {
    errorHandler,
    notFoundHandler,
    publicCors,
    protectedCors
} from './middleware';

const app = express();

// Security middleware - helmet adds various HTTP headers for security
app.use(helmet({
    contentSecurityPolicy: false, // Disabled to allow widget embedding
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow widget to be loaded cross-origin
}));

// Rate limiting for API endpoints
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        error: 'Too many requests, please try again later.',
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skip: (req) => !config.isProduction, // Skip rate limiting in development
});

// Stricter rate limiting for auth endpoints (prevent brute force)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 auth requests per windowMs
    message: {
        success: false,
        error: 'Too many authentication attempts, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => !config.isProduction,
});

// Rate limiting for public feedback submission (prevent spam)
const feedbackLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // Limit each IP to 10 feedback submissions per minute
    message: {
        success: false,
        error: 'Too many feedback submissions, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => !config.isProduction,
});

// Body parsing middleware
app.use(express.json({ limit: '10kb' })); // Limit body size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Health check endpoint (no rate limiting)
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
        version: '1.0.0',
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'Feedback Pulse API',
        version: '1.0.0',
        status: 'running',
        documentation: '/docs/api.md',
    });
});

// Widget routes (public CORS - allows all origins)
// No rate limiting for widget.js as it's just serving static JS
app.use('/widget.js', publicCors, widgetRoutes);

// Public API routes (public CORS - for widget submissions)
// Apply feedback rate limiter to prevent spam
app.use('/api/public', publicCors, feedbackLimiter, publicRoutes);

// Auth routes with stricter rate limiting
app.use('/api/auth', protectedCors, authLimiter, authRoutes);

// Protected API routes (restricted CORS) with standard rate limiting
app.use('/api/projects', protectedCors, apiLimiter, projectRoutes);
app.use('/api/feedback', protectedCors, apiLimiter, feedbackRoutes);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = config.port;

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   Feedback Pulse Backend Server                                ║
║                                                                ║
║   Server running on: http://localhost:${PORT}                  ║
║   Environment: ${config.nodeEnv.padEnd(41)}                    ║
║   Health check: http://localhost:${PORT}/health                ║
║   Rate Limiting: ${config.isProduction ? 'ENABLED' : 'DISABLED (dev)'}                              ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `);
});

export default app;
