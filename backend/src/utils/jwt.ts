import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import config from '../config';

export interface TokenPayload {
    userId: string;
    email: string;
}

export const generateToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, config.jwtSecret, {
        expiresIn: config.jwtExpiresIn as SignOptions['expiresIn'],
    });
};

export const verifyToken = (token: string): TokenPayload | null => {
    try {
        const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload & TokenPayload;
        return {
            userId: decoded.userId,
            email: decoded.email,
        };
    } catch (error) {
        return null;
    }
};

export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7);
};
