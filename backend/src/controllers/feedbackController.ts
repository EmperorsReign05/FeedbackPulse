import { Request, Response, NextFunction } from 'express';
import { feedbackService, projectService, geminiService } from '../services';
import {
    submitFeedbackSchema,
    feedbackQuerySchema,
} from '../utils/validation';

/**
 * POST /api/public/feedback
 * Submits feedback from the widget (public endpoint)
 */
export const submitFeedback = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const validatedData = submitFeedbackSchema.parse(req.body);

        // Find project by key
        const project = await projectService.getProjectByKey(validatedData.projectKey);

        if (!project) {
            res.status(404).json({
                success: false,
                error: 'Invalid project key',
            });
            return;
        }

        const feedback = await feedbackService.submitFeedback(project.id, {
            type: validatedData.type,
            message: validatedData.message,
        });

        res.status(201).json({
            success: true,
            data: feedback,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/projects/:projectId/feedback
 * Gets paginated feedback for a project
 */
export const getFeedback = async (
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

        // Verify project ownership
        const project = await projectService.getProject(projectId, req.user.userId);

        if (!project) {
            res.status(404).json({
                success: false,
                error: 'Project not found',
            });
            return;
        }

        // Parse and validate query params
        const query = feedbackQuerySchema.parse(req.query);
        const feedback = await feedbackService.getFeedback(projectId, query);

        res.json({
            success: true,
            ...feedback,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/feedback/:feedbackId/sentiment
 * Analyzes sentiment using Gemini API
 */
export const analyzeSentiment = async (
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

        const { feedbackId } = req.params;

        // Verify ownership
        const hasAccess = await feedbackService.verifyFeedbackOwnership(
            feedbackId,
            req.user.userId
        );

        if (!hasAccess) {
            res.status(404).json({
                success: false,
                error: 'Feedback not found',
            });
            return;
        }

        // Get feedback
        const feedback = await feedbackService.getFeedbackById(feedbackId);

        if (!feedback) {
            res.status(404).json({
                success: false,
                error: 'Feedback not found',
            });
            return;
        }

        // Analyze sentiment
        const sentiment = await geminiService.analyzeSentiment(feedback.message);

        // Update feedback with sentiment
        const updatedFeedback = await feedbackService.updateSentiment(feedbackId, sentiment);

        res.json({
            success: true,
            data: {
                feedbackId,
                sentiment,
                feedback: updatedFeedback,
            },
        });
    } catch (error) {
        next(error);
    }
};
