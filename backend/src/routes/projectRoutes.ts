import { Router } from 'express';
import { projectController, feedbackController } from '../controllers';
import { requireAuth } from '../middleware';

const router = Router();

// All project routes are protected
router.use(requireAuth);

// Project CRUD
router.post('/', projectController.createProject);
router.get('/', projectController.listProjects);
router.get('/:projectId', projectController.getProject);
router.put('/:projectId', projectController.updateProject);
router.delete('/:projectId', projectController.deleteProject);

// Regenerate project key
router.post('/:projectId/regenerate-key', projectController.regenerateProjectKey);

// Feedback for a project
router.get('/:projectId/feedback', feedbackController.getFeedback);

export default router;

