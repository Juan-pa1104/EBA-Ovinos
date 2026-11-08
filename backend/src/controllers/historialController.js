import { pool } from '../config/db.js';
import { ah } from '../utils/asyncHandler.js';
import { obtenerPredioCompleto } from './predioController.js';

async function construirLibertadesPorEvaluacion(evaluacionIds) {
  const mapa = new Map();

  if (evaluacionIds.length === 0) return mapa;

  const marcadores = evaluacionIds.map(() => '?').join(', ');
  const [items] = await pool.query(
    `SELECT evaluacion_id, libertad_id, puntaje
     FROM item_evaluacion
     WHERE evaluacion_id IN (${marcadores})`,
    evaluacionIds,
  );

  for (const item of items) {
    if (item.puntaje === null) continue;
    if (!mapa.has(item.evaluacion_id)) mapa.set(item.evaluacion_id, new Map());
    const porLibertad = mapa.get(item.evaluacion_id);
    if (!porLibertad.has(item.libertad_id)) porLibertad.set(item.libertad_id, []);
    porLibertad.get(item.libertad_id).push(Number(item.puntaje));
  }

  return mapa;
}

function libertadesDe(libertadesDb, porLibertad) {
  return libertadesDb.map((libertad) => {
    const puntajes = porLibertad?.get(libertad.id) ?? [];
    return {
      libertad_id: libertad.id,
      libertad_nombre: libertad.nombre,
      peso: Number(libertad.peso),
      puntaje: puntajes.length ? puntajes.reduce((total, valor) => total + valor, 0) / puntajes.length : 0,
    };
  });
}

export const historialPorPredio = ah(async (req, res) => {
  const predioId = Number(req.params.predioId ?? req.params.id);
  const predio = await obtenerPredioCompleto(predioId);

  if (!predio) {
    return res.status(404).json({ error: 'Predio no encontrado' });
  }
  if (req.usuario.rol === 'RESPONSABLE' && predio.responsable_id !== req.usuario.id) {
    return res.status(403).json({ error: 'No tienes acceso a este predio' });
  }

  const [evaluacionesDb] = await pool.query(
    `SELECT id, fecha, puntaje_total, clasificacion, cerrada_en
     FROM evaluaciones
     WHERE predio_id = ? AND estado = 'CERRADA'
     ORDER BY fecha ASC, id ASC`,
    [predioId],
  );
  const [libertadesDb] = await pool.query('SELECT id, nombre, peso FROM libertades ORDER BY id ASC');

  const porEvaluacion = await construirLibertadesPorEvaluacion(
    evaluacionesDb.map((evaluacion) => evaluacion.id),
  );

  const evaluaciones = evaluacionesDb.map((evaluacion) => ({
    id: evaluacion.id,
    fecha: evaluacion.fecha,
    puntaje_total: evaluacion.puntaje_total === null ? null : Number(evaluacion.puntaje_total),
    clasificacion: evaluacion.clasificacion,
    libertades: libertadesDe(libertadesDb, porEvaluacion.get(evaluacion.id)),
  }));

  return res.json({ predio, evaluaciones });
});

export const historialGlobal = ah(async (req, res) => {
  const { predioId, fechaDesde, fechaHasta, clasificacion } = req.query;

  const condiciones = ["e.estado = 'CERRADA'"];
  const params = [];

  if (req.usuario.rol === 'RESPONSABLE') {
    condiciones.push('p.responsable_id = ?');
    params.push(req.usuario.id);
  }
  if (predioId) {
    condiciones.push('e.predio_id = ?');
    params.push(predioId);
  }
  if (fechaDesde) {
    condiciones.push('e.fecha >= ?');
    params.push(fechaDesde);
  }
  if (fechaHasta) {
    condiciones.push('e.fecha <= ?');
    params.push(fechaHasta);
  }
  if (clasificacion) {
    condiciones.push('e.clasificacion = ?');
    params.push(clasificacion);
  }

  const [evaluacionesDb] = await pool.query(
    `SELECT e.id, e.fecha, e.puntaje_total, e.clasificacion, e.cerrada_en,
            e.predio_id, e.evaluador_id,
            p.nombre AS predio_nombre, p.municipio AS predio_municipio,
            p.especie AS predio_especie, p.sistema_productivo AS predio_sistema_productivo,
            u.nombre AS evaluador_nombre
     FROM evaluaciones e
     JOIN predios p ON p.id = e.predio_id
     LEFT JOIN usuarios u ON u.id = e.evaluador_id
     WHERE ${condiciones.join(' AND ')}
     ORDER BY e.fecha ASC, e.id ASC`,
    params,
  );

  const [libertadesDb] = await pool.query('SELECT id, nombre, peso FROM libertades ORDER BY id ASC');
  const porEvaluacion = await construirLibertadesPorEvaluacion(
    evaluacionesDb.map((evaluacion) => evaluacion.id),
  );

  const evaluaciones = evaluacionesDb.map((evaluacion) => ({
    id: evaluacion.id,
    fecha: evaluacion.fecha,
    puntaje_total: evaluacion.puntaje_total === null ? null : Number(evaluacion.puntaje_total),
    clasificacion: evaluacion.clasificacion,
    libertades: libertadesDe(libertadesDb, porEvaluacion.get(evaluacion.id)),
    predio_id: evaluacion.predio_id,
    predio_nombre: evaluacion.predio_nombre,
    predio_municipio: evaluacion.predio_municipio,
    predio_especie: evaluacion.predio_especie,
    predio_sistema_productivo: evaluacion.predio_sistema_productivo,
    evaluador_id: evaluacion.evaluador_id,
    evaluador_nombre: evaluacion.evaluador_nombre ?? '',
    cerrada_en: evaluacion.cerrada_en,
  }));

  return res.json({ evaluaciones });
});
