import { Router } from 'express';
import { obtenerDashboard } from '../controllers/dashboardController.js';
import { autenticar } from '../middleware/auth.js';

const router = Router();

router.get('/', autenticar, obtenerDashboard);

export default router;
