import { z } from 'zod';
export const signupSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email'),
    password: z
        .string()
        .min(6, 'Password must be at least 6 characters'),
    confirmPassword: z
        .string()
        .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email'),
    password: z
        .string()
        .min(1, 'Password is required'),
});

export const widgetIconOptions = ['chat', 'mail', 'question', 'star', 'settings', 'thumbsUp', 'envelope', 'info'] as const;
export const widgetPositionOptions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const;
export type WidgetIcon = typeof widgetIconOptions[number];
export type WidgetPosition = typeof widgetPositionOptions[number];

const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

export const createProjectSchema = z.object({
    name: z
        .string()
        .min(2, 'Project name must be at least 2 characters')
        .max(100, 'Project name must be at most 100 characters'),
    widgetIcon: z.enum(widgetIconOptions).default('chat'),
    widgetText: z.string().max(20).default('Feedback'),
    widgetPrimary: z.string().regex(hexColorRegex, 'Invalid hex color').default('#2563EB'),
    widgetTextColor: z.string().regex(hexColorRegex, 'Invalid hex color').default('#FFFFFF'),
    widgetBackground: z.string().regex(hexColorRegex, 'Invalid hex color').default('#FFFFFF'),
    widgetPosition: z.enum(widgetPositionOptions).default('bottom-right'),
    allowedDomains: z.string().max(1000).optional(),
    customIconUrl: z.string().url('Invalid URL format').optional().or(z.literal('')),
    webhookUrl: z.string().url('Invalid webhook URL').optional().or(z.literal('')),
    webhookEnabled: z.boolean().optional(),
});

export const updateProjectSchema = z.object({
    name: z.string().min(2, 'Project name must be at least 2 characters').max(100).optional(),
    widgetIcon: z.enum(widgetIconOptions).optional(),
    widgetText: z.string().max(20).optional(),
    widgetPrimary: z.string().regex(hexColorRegex, 'Invalid hex color').optional(),
    widgetTextColor: z.string().regex(hexColorRegex, 'Invalid hex color').optional(),
    widgetBackground: z.string().regex(hexColorRegex, 'Invalid hex color').optional(),
    widgetPosition: z.enum(widgetPositionOptions).optional(),
    allowedDomains: z.string().max(1000).optional(),
    customIconUrl: z.string().url('Invalid URL format').optional().or(z.literal('')),
    webhookUrl: z.string().url('Invalid webhook URL').optional().or(z.literal('')),
    webhookEnabled: z.boolean().optional(),
});

export const addLabelSchema = z.object({
    label: z
        .string()
        .min(1, 'Label is required')
        .max(50, 'Label must be at most 50 characters'),
});

export type SignupFormData = z.infer<typeof signupSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type CreateProjectFormData = z.infer<typeof createProjectSchema>;
export type UpdateProjectFormData = z.infer<typeof updateProjectSchema>;
export type AddLabelFormData = z.infer<typeof addLabelSchema>;

