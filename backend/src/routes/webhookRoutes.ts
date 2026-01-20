import { Router } from 'express';
import { webhookController } from '../controllers';
import { requireAuth } from '../middleware';

const router = Router();

// All webhook routes are protected and scoped to a project
router.use(requireAuth);

// Get webhook settings
router.get('/:projectId/webhook', webhookController.getWebhookSettings);

// Update webhook settings
router.put('/:projectId/webhook', webhookController.updateWebhookSettings);

// Regenerate webhook secret
router.post('/:projectId/webhook/regenerate-secret', webhookController.regenerateWebhookSecret);

// Test webhook
router.post('/:projectId/webhook/test', webhookController.testWebhook);

export default router;
