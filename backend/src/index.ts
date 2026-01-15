import express from 'express';
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

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.send('Feedback Pulse API is running ');
})

// Widget routes (public CORS - allows all origins)
app.use('/widget.js', publicCors, widgetRoutes);

// Public API routes (public CORS - for widget submissions)
app.use('/api/public', publicCors, publicRoutes);

// Protected API routes (restricted CORS)
app.use('/api/auth', protectedCors, authRoutes);
app.use('/api/projects', protectedCors, projectRoutes);
app.use('/api/feedback', protectedCors, feedbackRoutes);

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
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `);
});

export default app;
