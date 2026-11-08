import { Router } from 'express';
import {
  listarPredios,
  obtenerPredioPorId,
  crearPredio,
  actualizarPredio,
  eliminarPredio,
} from '../controllers/predioController.js';
import { historialPorPredio } from '../controllers/historialController.js';
import { autenticar, autorizarRoles } from '../middleware/auth.js';

const router = Router();

router.get('/', autenticar, listarPredios);
router.get('/:id/historial', autenticar, historialPorPredio);
router.get('/:id', autenticar, obtenerPredioPorId);
router.post('/', autenticar, autorizarRoles('ADMIN', 'EVALUADOR'), crearPredio);
router.put('/:id', autenticar, autorizarRoles('ADMIN', 'EVALUADOR'), actualizarPredio);
router.delete('/:id', autenticar, autorizarRoles('ADMIN', 'EVALUADOR'), eliminarPredio);

export default router;
