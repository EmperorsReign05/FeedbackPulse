import { Router } from 'express';
import { widgetController } from '../controllers';

const router = Router();

// Widget JavaScript serving
router.get('/', widgetController.serveWidget);

export default router;
