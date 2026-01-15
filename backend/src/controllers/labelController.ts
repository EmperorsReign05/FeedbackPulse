import { Request, Response, NextFunction } from 'express';
import { labelService, feedbackService } from '../services';
import { addLabelSchema } from '../utils/validation';

// POST /api/feedback/:feedbackId/labels
// Adds a label to a feedback
export const addLabel = async (
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

        const validatedData = addLabelSchema.parse(req.body);
        const label = await labelService.addLabel(feedbackId, validatedData.label);

        res.status(201).json({
            success: true,
            data: label,
        });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/feedback/:feedbackId/labels/:labelId
// Removes a label from a feedback
export const removeLabel = async (
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

        const { feedbackId, labelId } = req.params;

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

        const success = await labelService.removeLabel(labelId, feedbackId);

        if (!success) {
            res.status(404).json({
                success: false,
                error: 'Label not found',
            });
            return;
        }

        res.json({
            success: true,
            message: 'Label removed successfully',
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/feedback/:feedbackId/labels
// Gets all labels for a feedback
export const getLabels = async (
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

        const labels = await labelService.getLabelsForFeedback(feedbackId);

        res.json({
            success: true,
            data: labels,
        });
    } catch (error) {
        next(error);
    }
};
