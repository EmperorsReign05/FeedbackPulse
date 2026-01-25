import { Request, Response, NextFunction } from 'express';
import { authService } from '../services';
import { signupSchema, loginSchema } from '../utils/validation';

// POST /api/auth/signup
export const signup = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const validatedData = signupSchema.parse(req.body);
        const result = await authService.signup(validatedData);

        if (!result.success) {
            res.status(400).json({
                success: false,
                error: result.error,
            });
            return;
        }

        res.status(201).json({
            success: true,
            data: {
                token: result.token,
                user: result.user,
            },
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/auth/login
export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const validatedData = loginSchema.parse(req.body);
        const result = await authService.login(validatedData);

        if (!result.success) {
            res.status(401).json({
                success: false,
                error: result.error,
            });
            return;
        }

        res.json({
            success: true,
            data: {
                token: result.token,
                user: result.user,
            },
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/auth/me
export const me = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Not authenticated',
            });
            return;
        }

        const user = await authService.getUserById(req.user.userId);

        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found',
            });
            return;
        }

        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/auth/google
export const googleLogin = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            res.status(400).json({
                success: false,
                error: 'ID token is required',
            });
            return;
        }

        const result = await authService.googleLogin(idToken);

        if (!result.success) {
            res.status(401).json({
                success: false,
                error: result.error,
            });
            return;
        }

        res.json({
            success: true,
            data: {
                token: result.token,
                user: result.user,
            },
        });
    } catch (error) {
        next(error);
    }
};
