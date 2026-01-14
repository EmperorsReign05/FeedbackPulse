import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { generateToken, TokenPayload } from '../utils/jwt';
import { SignupInput, LoginInput } from '../utils/validation';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

export interface AuthResult {
    success: boolean;
    token?: string;
    user?: {
        id: string;
        email: string;
    };
    error?: string;
}

/**
 * Registers a new user with email and password
 */
export const signup = async (input: SignupInput): Promise<AuthResult> => {
    const { email, password } = input;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        return {
            success: false,
            error: 'A user with this email already exists',
        };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
        data: {
            email,
            passwordHash,
        },
    });

    // Generate token
    const tokenPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
    };
    const token = generateToken(tokenPayload);

    return {
        success: true,
        token,
        user: {
            id: user.id,
            email: user.email,
        },
    };
};

/**
 * Authenticates a user with email and password
 */
export const login = async (input: LoginInput): Promise<AuthResult> => {
    const { email, password } = input;

    // Find user
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        return {
            success: false,
            error: 'Invalid email or password',
        };
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
        return {
            success: false,
            error: 'Invalid email or password',
        };
    }

    // Generate token
    const tokenPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
    };
    const token = generateToken(tokenPayload);

    return {
        success: true,
        token,
        user: {
            id: user.id,
            email: user.email,
        },
    };
};

/**
 * Gets user by ID (for /me endpoint)
 */
export const getUserById = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            createdAt: true,
        },
    });

    return user;
};
