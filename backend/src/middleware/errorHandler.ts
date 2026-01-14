import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

/**
 * Global error handler middleware
 */
export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    console.error('Error:', err);

    // Handle Zod validation errors
    if (err instanceof ZodError) {
        res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: err.errors.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
            })),
        });
        return;
    }

    // Handle known error types
    if (err.name === 'ValidationError') {
        res.status(400).json({
            success: false,
            error: err.message,
        });
        return;
    }

    // Default server error
    res.status(500).json({
        success: false,
        error: 'Internal server error',
    });
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
    res.status(404).json({
        success: false,
        error: `Route ${req.method} ${req.path} not found`,
    });
};
