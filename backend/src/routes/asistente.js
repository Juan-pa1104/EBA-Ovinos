import { Router } from 'express';
import {
  crearConversacion,
  listarConversaciones,
  obtenerConversacion,
  listarMensajes,
  eliminarConversacion,
  chatear,
} from '../controllers/asistenteController.js';
import { autenticar } from '../middleware/auth.js';
import {
  consultarPrediosAutorizados,
  consultarEvaluacionesAutorizadas,
  consultarResultadosOficiales,
  consultarIndicadores,
  consultarLibertades,
  analizarOportunidadesMejora,
} from '../utils/asistenteTools.js';
import { ah } from '../utils/asyncHandler.js';

const router = Router();

function rechazarParametrosProhibidos(req, res, next) {
  const prohibidos = new Set(['usuario_id', 'usuarioid', 'user_id', 'correo', 'password', 'token', 'sql', 'query']);
  for (const clave of Object.keys(req.query ?? {})) {
    if (prohibidos.has(clave.toLowerCase())) {
      return res.status(400).json({ error: 'Parámetro no permitido: la autorización se determina por JWT' });
    }
  }
  return next();
}

// Todas las rutas exigen autenticación. El usuario se obtiene solo de req.usuario (JWT).
router.post('/conversaciones/:id/chat', autenticar, chatear);
router.post('/conversaciones', autenticar, crearConversacion);
router.get('/conversaciones', autenticar, listarConversaciones);
router.get('/conversaciones/:id/mensajes', autenticar, listarMensajes);
router.get('/conversaciones/:id', autenticar, obtenerConversacion);
router.delete('/conversaciones/:id', autenticar, eliminarConversacion);

// F2: herramientas de consulta controladas (solo lectura, sin OpenAI todavía)
router.get('/tools/predios', autenticar, rechazarParametrosProhibidos, ah(async (req, res) => {
  const data = await consultarPrediosAutorizados(req.usuario, {
    busqueda: req.query.busqueda,
    especie: req.query.especie,
    sistema_productivo: req.query.sistema_productivo,
    limite: req.query.limite,
  });
  return res.json(data);
}));

router.get('/tools/evaluaciones', autenticar, rechazarParametrosProhibidos, ah(async (req, res) => {
  const data = await consultarEvaluacionesAutorizadas(req.usuario, {
    predioId: req.query.predioId,
    estado: req.query.estado,
    limite: req.query.limite,
  });
  return res.json(data);
}));

router.get('/tools/evaluaciones/:id/resultados', autenticar, rechazarParametrosProhibidos, ah(async (req, res) => {
  try {
    const data = await consultarResultadosOficiales(req.usuario, req.params.id);
    return res.json(data);
  } catch (err) {
    return res.status(err.codigo || 500).json({ error: err.message });
  }
}));

router.get('/tools/indicadores', autenticar, rechazarParametrosProhibidos, ah(async (req, res) => {
  const data = await consultarIndicadores(req.usuario, {
    numero: req.query.numero,
    especie: req.query.especie,
    sistema_productivo: req.query.sistema_productivo,
    es_ovino_de_lana: req.query.es_ovino_de_lana,
    limite: req.query.limite,
  });
  return res.json(data);
}));

router.get('/tools/libertades', autenticar, rechazarParametrosProhibidos, ah(async (req, res) => {
  const data = await consultarLibertades(req.usuario);
  return res.json(data);
}));

router.get('/tools/evaluaciones/:id/oportunidades', autenticar, rechazarParametrosProhibidos, ah(async (req, res) => {
  try {
    const data = await analizarOportunidadesMejora(req.usuario, req.params.id);
    return res.json(data);
  } catch (err) {
    return res.status(err.codigo || 500).json({ error: err.message });
  }
}));

export default router;
