import dotenv from 'dotenv';

dotenv.config();

// Validate required environment variables in production
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
if (process.env.NODE_ENV === 'production') {
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    // Warn if using default JWT secret in production
    if (process.env.JWT_SECRET === 'default-secret-key') {
        console.warn('WARNING: Using default JWT secret in production is insecure!');
    }
}

export const config = {
    // Server
    port: parseInt(process.env.PORT || '8080', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',

    // Database
    databaseUrl: process.env.DATABASE_URL,

    // JWT
    jwtSecret: process.env.JWT_SECRET || 'default-secret-key',
    jwtExpiresIn: '7d',

    // URLs
    frontendUrl: process.env.FRONTEND_URL || 'https://feedback-pulse-murex.vercel.app',

    backendUrl: process.env.BACKEND_URL || process.env.RENDER_EXTERNAL_URL || 'http://localhost:8080',

    // External APIs
    geminiApiKey: process.env.GEMINI_API_KEY,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
};

export default config;
