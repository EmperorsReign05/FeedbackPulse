import { z } from 'zod';

// Auth validation schemas
export const signupSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
});

// Widget customization enums
export const widgetIconEnum = z.enum(['chat', 'mail', 'question', 'star', 'settings', 'thumbsUp', 'envelope', 'info']);
export const widgetPositionEnum = z.enum(['top-left', 'top-right', 'bottom-left', 'bottom-right']);

// Hex color validation regex
const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

// Project validation schemas
export const createProjectSchema = z.object({
    name: z.string().min(2, 'Project name must be at least 2 characters'),
    // Widget customization (all optional with defaults)
    widgetIcon: widgetIconEnum.default('chat'),
    widgetText: z.string().min(1).max(20).default('Feedback'),
    widgetPrimary: z.string().regex(hexColorRegex, 'Invalid hex color').default('#2563EB'),
    widgetTextColor: z.string().regex(hexColorRegex, 'Invalid hex color').default('#FFFFFF'),
    widgetBackground: z.string().regex(hexColorRegex, 'Invalid hex color').default('#FFFFFF'),
    widgetPosition: widgetPositionEnum.default('bottom-right'),
    // Domain restriction (optional - comma-separated list of allowed domains)
    // Supports: custom domains, *.netlify.app, *.vercel.app, *.pages.dev, localhost, etc.
    allowedDomains: z.string().max(1000).optional(),
});

// Feedback validation schemas
export const feedbackTypeEnum = z.enum(['Bug', 'Feature', 'Other']);

export const submitFeedbackSchema = z.object({
    projectKey: z.string().min(1, 'Project key is required'),
    type: feedbackTypeEnum,
    message: z.string().min(3, 'Message must be at least 3 characters'),
});

// Label validation schemas
export const addLabelSchema = z.object({
    label: z.string().min(1, 'Label is required').max(50, 'Label must be at most 50 characters'),
});

// Query params schemas
export const feedbackQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    type: z.enum(['All', 'Bug', 'Feature', 'Other']).default('All'),
});

// Type exports
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type SubmitFeedbackInput = z.infer<typeof submitFeedbackSchema>;
export type AddLabelInput = z.infer<typeof addLabelSchema>;
export type FeedbackQueryInput = z.infer<typeof feedbackQuerySchema>;
