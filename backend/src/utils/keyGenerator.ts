import crypto from 'crypto';

/**
 * Generates a unique project key for widget identification
 * Format: fp_XXXXXXXXXX (10 random alphanumeric characters)
 */
export const generateProjectKey = (): string => {
    const randomBytes = crypto.randomBytes(8);
    const base64 = randomBytes.toString('base64url').substring(0, 10);
    return `fp_${base64}`;
};

/**
 * Validates project key format
 */
export const isValidProjectKey = (key: string): boolean => {
    return /^fp_[a-zA-Z0-9_-]{10}$/.test(key);
};
