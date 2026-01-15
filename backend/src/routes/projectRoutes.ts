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
router.delete('/:projectId', projectController.deleteProject);

// Feedback for a project
router.get('/:projectId/feedback', feedbackController.getFeedback);

export default router;
