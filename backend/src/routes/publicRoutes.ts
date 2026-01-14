import { Router } from 'express';
import { feedbackController } from '../controllers';

const router = Router();

// Public feedback submission (from widget)
router.post('/feedback', feedbackController.submitFeedback);

export default router;
