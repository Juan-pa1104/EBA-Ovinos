import { Router } from 'express';
import {
  listarEvaluaciones,
  crearEvaluacion,
  obtenerEvaluacion,
  actualizarEvaluacion,
  actualizarItemEvaluacion,
  cerrarEvaluacion,
  obtenerRecomendacionIA,
  regenerarRecomendacionIA,
  descargarReportePDF,
} from '../controllers/evaluacionController.js';
import { historialGlobal } from '../controllers/historialController.js';
import { autenticar, autorizarRoles } from '../middleware/auth.js';

const router = Router();

router.get('/', autenticar, listarEvaluaciones);

// Debe declararse antes de /:id para que no lo capture la ruta dinámica.
router.get('/historial-global', autenticar, autorizarRoles('ADMIN'), historialGlobal);

router.post('/', autenticar, autorizarRoles('ADMIN', 'EVALUADOR'), crearEvaluacion);
router.get('/:id', autenticar, obtenerEvaluacion);

router.patch(
  '/:id/indicadores/:indicadorId',
  autenticar,
  autorizarRoles('ADMIN', 'EVALUADOR'),
  actualizarItemEvaluacion,
);
router.patch('/:id', autenticar, autorizarRoles('ADMIN', 'EVALUADOR'), actualizarEvaluacion);
router.put('/:id', autenticar, autorizarRoles('ADMIN', 'EVALUADOR'), actualizarEvaluacion);
router.post('/:id/cerrar', autenticar, autorizarRoles('ADMIN', 'EVALUADOR'), cerrarEvaluacion);

router.get('/:id/recomendaciones-ia', autenticar, obtenerRecomendacionIA);
router.post('/:id/recomendaciones-ia', autenticar, regenerarRecomendacionIA);

router.get('/:id/reporte.pdf', autenticar, descargarReportePDF);

export default router;
