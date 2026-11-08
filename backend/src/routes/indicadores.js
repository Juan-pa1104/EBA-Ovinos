import { Router } from 'express';
import {
  listarIndicadores,
  obtenerIndicadorPorId,
  actualizarIndicador,
  listarLibertades,
} from '../controllers/indicadorController.js';
import { autenticar, autorizarRoles } from '../middleware/auth.js';

const router = Router();

router.get('/libertades', autenticar, listarLibertades);
router.get('/', autenticar, listarIndicadores);
router.get('/:id', autenticar, obtenerIndicadorPorId);
router.put('/:id', autenticar, autorizarRoles('ADMIN'), actualizarIndicador);

export default router;
