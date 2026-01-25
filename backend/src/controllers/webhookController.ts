import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { webhookService } from '../services';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for webhook settings
const webhookSettingsSchema = z.object({
    webhookUrl: z.string().url('Invalid webhook URL').optional().nullable(),
    webhookEnabled: z.boolean().optional(),
});

// GET /api/projects/:projectId/webhook
export const getWebhookSettings = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Not authenticated',
            });
            return;
        }

        const { projectId } = req.params;

        // Verify ownership and get project
        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                userId: req.user.userId,
            },
            select: {
                id: true,
                webhookUrl: true,
                webhookSecret: true,
                webhookEnabled: true,
            },
        });

        if (!project) {
            res.status(404).json({
                success: false,
                error: 'Project not found',
            });
            return;
        }

        res.json({
            success: true,
            data: {
                webhookUrl: project.webhookUrl,
                webhookSecret: project.webhookSecret,
                webhookEnabled: project.webhookEnabled,
            },
        });
    } catch (error) {
        next(error);
    }
};

// PUT /api/projects/:projectId/webhook
export const updateWebhookSettings = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Not authenticated',
            });
            return;
        }

        const { projectId } = req.params;

        // Validate input
        const validatedData = webhookSettingsSchema.parse(req.body);

        // Verify ownership
        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                userId: req.user.userId,
            },
        });

        if (!project) {
            res.status(404).json({
                success: false,
                error: 'Project not found',
            });
            return;
        }

        // Validate webhook URL if provided
        if (validatedData.webhookUrl && !webhookService.isValidWebhookUrl(validatedData.webhookUrl)) {
            res.status(400).json({
                success: false,
                error: 'Invalid webhook URL. Must be a valid HTTP or HTTPS URL.',
            });
            return;
        }

        // Build update data
        const updateData: {
            webhookUrl?: string | null;
            webhookEnabled?: boolean;
            webhookSecret?: string;
        } = {};

        if (validatedData.webhookUrl !== undefined) {
            updateData.webhookUrl = validatedData.webhookUrl;
            // Generate a new secret if URL is being set and no secret exists
            if (validatedData.webhookUrl && !project.webhookSecret) {
                updateData.webhookSecret = webhookService.generateWebhookSecret();
            }
        }

        if (validatedData.webhookEnabled !== undefined) {
            updateData.webhookEnabled = validatedData.webhookEnabled;
        }

        // Update project
        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: updateData,
            select: {
                id: true,
                webhookUrl: true,
                webhookSecret: true,
                webhookEnabled: true,
            },
        });

        res.json({
            success: true,
            data: {
                webhookUrl: updatedProject.webhookUrl,
                webhookSecret: updatedProject.webhookSecret,
                webhookEnabled: updatedProject.webhookEnabled,
            },
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/projects/:projectId/webhook/regenerate-secret
export const regenerateWebhookSecret = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Not authenticated',
            });
            return;
        }

        const { projectId } = req.params;

        // Verify ownership
        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                userId: req.user.userId,
            },
        });

        if (!project) {
            res.status(404).json({
                success: false,
                error: 'Project not found',
            });
            return;
        }

        // Generate new secret
        const newSecret = webhookService.generateWebhookSecret();

        // Update project
        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: { webhookSecret: newSecret },
            select: {
                id: true,
                webhookUrl: true,
                webhookSecret: true,
                webhookEnabled: true,
            },
        });

        res.json({
            success: true,
            data: {
                webhookUrl: updatedProject.webhookUrl,
                webhookSecret: updatedProject.webhookSecret,
                webhookEnabled: updatedProject.webhookEnabled,
            },
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/projects/:projectId/webhook/test
export const testWebhook = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Not authenticated',
            });
            return;
        }

        const { projectId } = req.params;

        // Verify ownership and get project
        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                userId: req.user.userId,
            },
        });

        if (!project) {
            res.status(404).json({
                success: false,
                error: 'Project not found',
            });
            return;
        }

        if (!project.webhookUrl) {
            res.status(400).json({
                success: false,
                error: 'No webhook URL configured',
            });
            return;
        }

        if (!project.webhookSecret) {
            res.status(400).json({
                success: false,
                error: 'No webhook secret configured',
            });
            return;
        }

        // Send test webhook with mock feedback data
        const testFeedback = {
            id: 'test_feedback_id',
            type: 'Feature' as const,
            message: 'This is a test webhook from FeedbackPulse. If you received this, your webhook integration is working correctly!',
            sentiment: null,
            createdAt: new Date(),
        };

        const result = await webhookService.sendWebhook(
            {
                webhookUrl: project.webhookUrl,
                webhookSecret: project.webhookSecret,
                projectId: project.id,
                projectName: project.name,
            },
            testFeedback
        );

        if (result.success) {
            res.json({
                success: true,
                message: 'Test webhook sent successfully',
                statusCode: result.statusCode,
            });
        } else {
            res.status(400).json({
                success: false,
                error: result.error || 'Failed to send test webhook',
                statusCode: result.statusCode,
            });
        }
    } catch (error) {
        next(error);
    }
};
