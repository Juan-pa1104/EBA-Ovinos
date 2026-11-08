import { Router } from 'express';
import {
  listarUsuarios,
  listarResponsables,
  crearUsuario,
  actualizarUsuario,
  cambiarEstadoUsuario,
  asignarPredios,
} from '../controllers/usuarioController.js';
import { autenticar, autorizarRoles } from '../middleware/auth.js';

const router = Router();

router.get('/responsables', autenticar, autorizarRoles('ADMIN', 'EVALUADOR'), listarResponsables);
router.get('/', autenticar, autorizarRoles('ADMIN'), listarUsuarios);
router.post('/', autenticar, autorizarRoles('ADMIN'), crearUsuario);
router.put('/:id', autenticar, autorizarRoles('ADMIN'), actualizarUsuario);
router.patch('/:id/estado', autenticar, autorizarRoles('ADMIN'), cambiarEstadoUsuario);
router.patch('/:id/predios', autenticar, autorizarRoles('ADMIN'), asignarPredios);

export default router;
