import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';

const router = Router();

router.get('/metrics', dashboardController.getMetrics);

export default router;