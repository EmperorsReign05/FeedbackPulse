import { OAuth2Client } from 'google-auth-library';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { generateToken, TokenPayload } from '../utils/jwt';
import { SignupInput, LoginInput } from '../utils/validation';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export interface AuthResult {
    success: boolean;
    token?: string;
    user?: {
        id: string;
        email: string;
    };
    error?: string;
}

export const signup = async (input: SignupInput): Promise<AuthResult> => {
    const { email, password } = input;

    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        return {
            success: false,
            error: 'A user with this email already exists',
        };
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
        data: {
            email,
            passwordHash,
        },
    });

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

export const login = async (input: LoginInput): Promise<AuthResult> => {
    const { email, password } = input;

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user || !user.passwordHash) {
        return {
            success: false,
            error: 'Invalid email or password',
        };
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
        return {
            success: false,
            error: 'Invalid email or password',
        };
    }

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

export const googleLogin = async (idToken: string): Promise<AuthResult> => {
    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();

        if (!payload || !payload.email) {
            return {
                success: false,
                error: 'Invalid Google Token',
            };
        }

        const { email, sub: googleId } = payload;

        let user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    googleId,
                },
            });
        } else if (!user.googleId) {
            user = await prisma.user.update({
                where: { id: user.id },
                data: { googleId },
            });
        }

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
    } catch (error) {
        console.error('Google Auth Error:', error);
        return {
            success: false,
            error: 'Google authentication failed',
        };
    }
};

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
