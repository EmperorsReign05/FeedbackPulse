import cors from 'cors';
import config from '../config';

//cors configuration

// CORS for public routes
// Allows all origins for cross-domain widget usage
export const publicCors = cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: false,
});

// CORS for protected API routes
// Only allows requests from the frontend origin
export const protectedCors = cors({
    origin: (origin, callback) => {
        // Allow requests with no origin 
        if (!origin) {
            callback(null, true);
            return;
        }

        // Check if origin matches frontend URL
        const allowedOrigins = [
            config.frontendUrl,
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'https://feedback-pulse-murex.vercel.app',
        ];

        if (allowedOrigins.includes(origin) || config.nodeEnv === 'development') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
});

// Default CORS for general use
export const defaultCors = cors({
    origin: config.nodeEnv === 'development' ? '*' : config.frontendUrl,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
});
