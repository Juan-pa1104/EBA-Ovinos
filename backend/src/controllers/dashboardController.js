import { pool } from '../config/db.js';
import { ah } from '../utils/asyncHandler.js';
import { normalizarPredio } from './predioController.js';

function fechaOrdenable(evaluacion) {
  return new Date(
    evaluacion.cerrada_en || evaluacion.updated_at || evaluacion.created_at || 0,
  ).getTime();
}

export const obtenerDashboard = ah(async (req, res) => {
  const { rol, id } = req.usuario;

  const params = [];
  const wherePredios = rol === 'RESPONSABLE' ? 'WHERE p.responsable_id = ?' : '';
  if (rol === 'RESPONSABLE') params.push(id);

  const [prediosRaw] = await pool.query(
    `SELECT p.*, u.nombre AS responsable_nombre
     FROM predios p
     LEFT JOIN usuarios u ON u.id = p.responsable_id
     ${wherePredios}
     ORDER BY p.nombre ASC, p.id ASC`,
    params,
  );

  let evaluacionesRaw = [];
  if (prediosRaw.length > 0) {
    const ids = prediosRaw.map((predio) => predio.id);
    const marcadores = ids.map(() => '?').join(', ');
    [evaluacionesRaw] = await pool.query(
      `SELECT e.*,
              p.nombre AS predio_nombre,
              p.especie AS predio_especie,
              p.sistema_productivo AS predio_sistema_productivo,
              u.nombre AS evaluador_nombre
       FROM evaluaciones e
       JOIN predios p ON p.id = e.predio_id
       LEFT JOIN usuarios u ON u.id = e.evaluador_id
       WHERE e.predio_id IN (${marcadores})
       ORDER BY e.created_at DESC, e.id DESC`,
      ids,
    );
  }

  const evaluaciones = evaluacionesRaw.map((evaluacion) => ({
    ...evaluacion,
    puntaje_total: evaluacion.puntaje_total === null ? null : Number(evaluacion.puntaje_total),
  }));

  const cerradas = evaluaciones.filter((evaluacion) => evaluacion.estado === 'CERRADA');
  const borradores = evaluaciones.filter((evaluacion) => evaluacion.estado === 'BORRADOR');

  let conteosUsuarios = { usuarios_activos: 0, evaluadores: 0, responsables: 0 };
  if (rol === 'ADMIN') {
    const [rows] = await pool.query(
      `SELECT
         SUM(activo = 1) AS usuarios_activos,
         SUM(rol = 'EVALUADOR' AND activo = 1) AS evaluadores,
         SUM(rol = 'RESPONSABLE' AND activo = 1) AS responsables
       FROM usuarios`,
    );
    const conteo = rows[0] ?? {};
    conteosUsuarios = {
      usuarios_activos: Number(conteo.usuarios_activos ?? 0),
      evaluadores: Number(conteo.evaluadores ?? 0),
      responsables: Number(conteo.responsables ?? 0),
    };
  }

  const cerradasPorPredio = new Map();
  for (const predio of prediosRaw) cerradasPorPredio.set(predio.id, []);
  for (const evaluacion of cerradas) {
    if (cerradasPorPredio.has(evaluacion.predio_id)) {
      cerradasPorPredio.get(evaluacion.predio_id).push(evaluacion);
    }
  }
  for (const lista of cerradasPorPredio.values()) {
    lista.sort((a, b) => fechaOrdenable(b) - fechaOrdenable(a));
  }

  const distribucion = {
    'EXCELENTE BIENESTAR': 0,
    ALTO: 0,
    MEDIO: 0,
    BAJO: 0,
    'SIN EVALUACIÓN': 0,
  };

  let prediosEvaluados = 0;
  const predios = prediosRaw.map((predio) => {
    const lista = cerradasPorPredio.get(predio.id) ?? [];
    const ultima = lista[0];
    if (ultima) prediosEvaluados += 1;

    const clave = ultima?.clasificacion ?? 'SIN EVALUACIÓN';
    distribucion[clave] = (distribucion[clave] ?? 0) + 1;

    return normalizarPredio({
      ...predio,
      ultima_clasificacion: ultima?.clasificacion ?? null,
      ultima_fecha: ultima?.cerrada_en ?? null,
      total_evaluaciones: lista.length,
      borradores: borradores.filter((evaluacion) => evaluacion.predio_id === predio.id).length,
    });
  });

  const puntajePromedio =
    cerradas.length > 0
      ? Number(
          (
            cerradas.reduce((total, evaluacion) => total + (evaluacion.puntaje_total ?? 0), 0) /
            cerradas.length
          ).toFixed(1),
        )
      : 0;

  const metricas = {
    // Claves que consume el frontend
    predios: prediosRaw.length,
    evaluaciones: evaluaciones.length,
    cerradas: cerradas.length,
    borradores: borradores.length,
    predios_evaluados: prediosEvaluados,
    predios_sin_responsable: prediosRaw.filter((predio) => !predio.responsable_id).length,
    usuarios_activos: conteosUsuarios.usuarios_activos,
    evaluadores: conteosUsuarios.evaluadores,
    responsables: conteosUsuarios.responsables,
    puntaje_promedio: puntajePromedio,
    // Compatibilidad con versiones anteriores
    total_predios: prediosRaw.length,
    total_evaluaciones: evaluaciones.length,
    evaluaciones_cerradas: cerradas.length,
  };

  const baseUltimas = rol === 'RESPONSABLE' ? cerradas : evaluaciones;
  const ultimasEvaluaciones = [...baseUltimas]
    .sort((a, b) => fechaOrdenable(b) - fechaOrdenable(a))
    .slice(0, 10);

  return res.json({
    rol,
    metricas,
    distribucion,
    ultimas_evaluaciones: ultimasEvaluaciones,
    predios,
  });
});
