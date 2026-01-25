import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface LabelData {
    id: string;
    label: string;
    createdAt: Date;
}

export const addLabel = async (
    feedbackId: string,
    label: string
): Promise<LabelData> => {
    const feedbackLabel = await prisma.feedbackLabel.create({
        data: {
            feedbackId,
            label,
        },
        select: {
            id: true,
            label: true,
            createdAt: true,
        },
    });

    return feedbackLabel;
};


export const removeLabel = async (
    labelId: string,
    feedbackId: string
): Promise<boolean> => {
    try {
        await prisma.feedbackLabel.delete({
            where: {
                id: labelId,
                feedbackId,
            },
        });
        return true;
    } catch (error) {
        return false;
    }
};


export const getLabelsForFeedback = async (
    feedbackId: string
): Promise<LabelData[]> => {
    return prisma.feedbackLabel.findMany({
        where: { feedbackId },
        select: {
            id: true,
            label: true,
            createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
    });
};
