import { Router } from 'express';
import { feedbackController, labelController } from '../controllers';
import { requireAuth } from '../middleware';

const router = Router();

// All feedback management routes are protected
router.use(requireAuth);

// Sentiment analysis
router.post('/:feedbackId/sentiment', feedbackController.analyzeSentiment);

// Label management
router.get('/:feedbackId/labels', labelController.getLabels);
router.post('/:feedbackId/labels', labelController.addLabel);
router.delete('/:feedbackId/labels/:labelId', labelController.removeLabel);

export default router;
