import { Request, Response, NextFunction } from 'express';
import { extractTokenFromHeader, verifyToken, TokenPayload } from '../utils/jwt';

// Extend Express Request to include user
declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
        }
    }
}

// Authentication middleware that protects routes
// Extracts and verifies JWT token from Authorization header
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
        res.status(401).json({
            success: false,
            error: 'Authentication required. Please provide a valid token.'
        });
        return;
    }

    const payload = verifyToken(token);

    if (!payload) {
        res.status(401).json({
            success: false,
            error: 'Invalid or expired token. Please login again.'
        });
        return;
    }

    req.user = payload;
    next();
};
