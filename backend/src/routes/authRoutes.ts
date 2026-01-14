import { Router } from 'express';
import { authController } from '../controllers';
import { requireAuth } from '../middleware';

const router = Router();

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Protected routes
router.get('/me', requireAuth, authController.me);

export default router;
