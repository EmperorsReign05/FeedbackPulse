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


export const getFeedback = async (
    projectId: string,
    query: FeedbackQueryInput
): Promise<PaginatedFeedback> => {
    const { page, limit, type } = query;
    const skip = (page - 1) * limit;

    const where: any = { projectId };
    if (type !== 'All') {
        where.type = type as FeedbackType;
    }

    const total = await prisma.feedback.count({ where });

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


export const deleteFeedback = async (feedbackId: string): Promise<void> => {
    await prisma.feedbackLabel.deleteMany({
        where: { feedbackId },
    });

    await prisma.feedback.delete({
        where: { id: feedbackId },
    });
};


export const deleteAllFeedback = async (projectId: string): Promise<number> => {
    const feedbackItems = await prisma.feedback.findMany({
        where: { projectId },
        select: { id: true },
    });

    const feedbackIds = feedbackItems.map(f => f.id);

    if (feedbackIds.length === 0) {
        return 0;
    }

    await prisma.feedbackLabel.deleteMany({
        where: { feedbackId: { in: feedbackIds } },
    });

    const result = await prisma.feedback.deleteMany({
        where: { projectId },
    });

    return result.count;
};
