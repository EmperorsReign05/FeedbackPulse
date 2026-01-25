import crypto from 'crypto';

export const generateProjectKey = (): string => {
    const randomBytes = crypto.randomBytes(8);
    const base64 = randomBytes.toString('base64url').substring(0, 10);
    return `fp_${base64}`;
};

export const isValidProjectKey = (key: string): boolean => {
    return /^fp_[a-zA-Z0-9_-]{10}$/.test(key);
};
