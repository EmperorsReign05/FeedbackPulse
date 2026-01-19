import { PrismaClient, FeedbackType, Sentiment } from '@prisma/client';
import { SubmitFeedbackInput, FeedbackQueryInput } from '../utils/validation';

const prisma = new PrismaClient();

export interface FeedbackWithLabels {
    id: string;
    type: FeedbackType;
    message: string;
    sentiment: Sentiment | null;
    createdAt: Date;
    labels: {
        id: string;
        label: string;
        createdAt: Date;
    }[];
}

export interface PaginatedFeedback {
    data: FeedbackWithLabels[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

// Submits feedback from the widget (public endpoint)
export const submitFeedback = async (
    projectId: string,
    input: Omit<SubmitFeedbackInput, 'projectKey'>
): Promise<FeedbackWithLabels> => {
    const feedback = await prisma.feedback.create({
        data: {
            projectId,
            type: input.type as FeedbackType,
            message: input.message,
        },
        include: {
            labels: {
                select: {
                    id: true,
                    label: true,
                    createdAt: true,
                },
            },
        },
    });

    return feedback;
};

// Gets paginated feedback for a project
export const getFeedback = async (
    projectId: string,
    query: FeedbackQueryInput
): Promise<PaginatedFeedback> => {
    const { page, limit, type } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { projectId };
    if (type !== 'All') {
        where.type = type as FeedbackType;
    }

    // Get total count
    const total = await prisma.feedback.count({ where });

    // Get paginated feedback
    const feedback = await prisma.feedback.findMany({
        where,
        include: {
            labels: {
                select: {
                    id: true,
                    label: true,
                    createdAt: true,
                },
                orderBy: { createdAt: 'desc' },
            },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
    });

    return {
        data: feedback,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    };
};

// Gets a single feedback by ID
export const getFeedbackById = async (
    feedbackId: string
): Promise<FeedbackWithLabels | null> => {
    return prisma.feedback.findUnique({
        where: { id: feedbackId },
        include: {
            labels: {
                select: {
                    id: true,
                    label: true,
                    createdAt: true,
                },
            },
        },
    });
};

// Verifies that a feedback belongs to a user's project
export const verifyFeedbackOwnership = async (
    feedbackId: string,
    userId: string
): Promise<boolean> => {
    const feedback = await prisma.feedback.findUnique({
        where: { id: feedbackId },
        include: {
            project: {
                select: { userId: true },
            },
        },
    });

    return feedback?.project.userId === userId;
};

/**
 * Updates sentiment for a feedback
 */
export const updateSentiment = async (
    feedbackId: string,
    sentiment: Sentiment
): Promise<FeedbackWithLabels> => {
    return prisma.feedback.update({
        where: { id: feedbackId },
        data: { sentiment },
        include: {
            labels: {
                select: {
                    id: true,
                    label: true,
                    createdAt: true,
                },
            },
        },
    });
};

// Deletes a feedback by ID (also deletes associated labels via cascade)
export const deleteFeedback = async (feedbackId: string): Promise<void> => {
    // First delete associated labels
    await prisma.feedbackLabel.deleteMany({
        where: { feedbackId },
    });

    // Then delete the feedback
    await prisma.feedback.delete({
        where: { id: feedbackId },
    });
};
