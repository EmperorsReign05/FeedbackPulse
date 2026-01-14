import { z } from 'zod';

// Auth validation schemas
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

// Project validation schemas
export const createProjectSchema = z.object({
    name: z
        .string()
        .min(2, 'Project name must be at least 2 characters')
        .max(100, 'Project name must be at most 100 characters'),
});

// Label validation schemas
export const addLabelSchema = z.object({
    label: z
        .string()
        .min(1, 'Label is required')
        .max(50, 'Label must be at most 50 characters'),
});

// Type exports
export type SignupFormData = z.infer<typeof signupSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type CreateProjectFormData = z.infer<typeof createProjectSchema>;
export type AddLabelFormData = z.infer<typeof addLabelSchema>;
