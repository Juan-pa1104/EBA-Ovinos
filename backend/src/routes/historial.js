import { Router } from 'express';
import { historialPorPredio, historialGlobal } from '../controllers/historialController.js';
import { autenticar, autorizarRoles } from '../middleware/auth.js';

const router = Router();

router.get('/predio/:predioId', autenticar, historialPorPredio);
router.get('/global', autenticar, autorizarRoles('ADMIN'), historialGlobal);

export default router;
