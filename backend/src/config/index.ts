import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: parseInt(process.env.PORT || '8080', 10),
    databaseUrl: process.env.DATABASE_URL || '',
    jwtSecret: process.env.JWT_SECRET || 'default_secret_change_me',
    jwtExpiresIn: '7d',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    nodeEnv: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
};

export default config;
