import { pool } from '../config/db.js';
import { ah } from '../utils/asyncHandler.js';
import { generarRecomendacionIA } from '../utils/ia.js';
import { generarReportePDF } from '../utils/pdf.js';
import { obtenerPredioCompleto } from './predioController.js';

const CAMPOS_APLICABILIDAD = {
  EXTENSIVO: 'aplica_extensivo',
  SEMI_INTENSIVO: 'aplica_semi_intensivo',
  INTENSIVO: 'aplica_intensivo',
  FAMILIAR: 'aplica_familiar',
};

const PUNTAJES_VALIDOS = new Set(['0', '20', '55', '100']);

function aplicaIndicador(indicador, predio) {
  const campo = CAMPOS_APLICABILIDAD[predio.sistema_productivo];
  if (!campo || !indicador[campo]) return false;
  if (indicador.solo_especie && indicador.solo_especie !== predio.especie) return false;
  if (indicador.solo_ovino_lana) {
    const esOvinoDeLana = predio.especie === 'OVINO' && Boolean(predio.es_ovino_de_lana);
    if (!esOvinoDeLana) return false;
  }
  return true;
}

function clasificar(puntaje) {
  if (puntaje === null || puntaje === undefined) return null;
  if (puntaje >= 90) return 'EXCELENTE BIENESTAR';
  if (puntaje >= 75) return 'ALTO';
  if (puntaje >= 50) return 'MEDIO';
  return 'BAJO';
}

function criterioSegunPuntaje(item) {
  if (item.puntaje === 100) return item.criterio_100;
  if (item.puntaje === 55) return item.criterio_55;
  if (item.puntaje === 20) return item.criterio_20;
  if (item.puntaje === 0) return item.criterio_0;
  return null;
}

function puedeVerEvaluacion(usuario, detalle) {
  if (!usuario || usuario.rol !== 'RESPONSABLE') return true;
  return detalle.predio?.responsable_id === usuario.id;
}

/**
 * Construye el detalle completo de una evaluación con su resumen y plan de mejora.
 */
async function construirDetalle(evaluacionId) {
  const [evaluaciones] = await pool.query('SELECT * FROM evaluaciones WHERE id = ? LIMIT 1', [
    evaluacionId,
  ]);
  const evaluacion = evaluaciones[0];
  if (!evaluacion) return null;

  const predio = await obtenerPredioCompleto(evaluacion.predio_id);

  const [evaluadores] = await pool.query(
    'SELECT id, nombre, correo FROM usuarios WHERE id = ? LIMIT 1',
    [evaluacion.evaluador_id],
  );

  const [itemsDb] = await pool.query(
    'SELECT * FROM item_evaluacion WHERE evaluacion_id = ? ORDER BY numero ASC, id ASC',
    [evaluacionId],
  );
  const [libertadesDb] = await pool.query('SELECT id, nombre, peso FROM libertades ORDER BY id ASC');

  const items = itemsDb.map((item) => ({
    ...item,
    libertad_peso: Number(item.libertad_peso ?? 0),
    puntaje: item.puntaje === null ? null : Number(item.puntaje),
  }));

  const resumenLibertades = libertadesDb.map((libertad) => {
    const itemsLibertad = items.filter((item) => item.libertad_id === libertad.id);
    const calificados = itemsLibertad.filter((item) => item.puntaje !== null);
    return {
      libertad_id: libertad.id,
      libertad_nombre: libertad.nombre,
      peso: Number(libertad.peso),
      puntaje: calificados.length
        ? calificados.reduce((total, item) => total + item.puntaje, 0) / calificados.length
        : null,
      calificados: calificados.length,
      total: itemsLibertad.length,
    };
  });

  const puntajeCalculado = resumenLibertades
    .filter((libertad) => libertad.puntaje !== null)
    .reduce((total, libertad) => total + libertad.puntaje * libertad.peso, 0);

  const esCerrada = evaluacion.estado === 'CERRADA';
  const puntajeTotal =
    esCerrada && evaluacion.puntaje_total !== null
      ? Number(evaluacion.puntaje_total)
      : puntajeCalculado;
  const clasificacion = esCerrada ? evaluacion.clasificacion : clasificar(puntajeCalculado);
  const completo = items.length > 0 && items.every((item) => item.puntaje !== null);

  const planMejora = items
    .filter((item) => item.puntaje !== null && item.puntaje <= 55)
    .sort((a, b) => {
      if (a.puntaje !== b.puntaje) return a.puntaje - b.puntaje;
      return (b.libertad_peso ?? 0) - (a.libertad_peso ?? 0);
    })
    .map((item) => ({
      indicador_id: item.indicador_id,
      numero: item.numero,
      nombre: item.nombre,
      libertad_id: item.libertad_id,
      libertad_nombre: item.libertad_nombre,
      libertad_peso: item.libertad_peso,
      seccion: item.seccion ?? null,
      puntaje: item.puntaje,
      criterio_actual: criterioSegunPuntaje(item),
      criterio_100: item.criterio_100,
      observacion: item.observacion ?? null,
    }));

  return {
    ...evaluacion,
    puntaje_total: puntajeTotal,
    clasificacion,
    predio,
    evaluador: evaluadores[0] ?? { id: evaluacion.evaluador_id, nombre: '', correo: '' },
    items,
    resumen: {
      libertades: resumenLibertades,
      puntaje_total: puntajeTotal,
      clasificacion,
      calificados: resumenLibertades.reduce((total, libertad) => total + libertad.calificados, 0),
      total: resumenLibertades.reduce((total, libertad) => total + libertad.total, 0),
      completo,
    },
    plan_mejora: planMejora,
  };
}

export const listarEvaluaciones = ah(async (req, res) => {
  const { rol, id } = req.usuario;
  const { search, estado, predioId } = req.query;
  const limit = Math.min(Math.max(Number(req.query.limit) || 200, 1), 500);

  const condiciones = [];
  const params = [];

  if (rol === 'RESPONSABLE') {
    condiciones.push('p.responsable_id = ?');
    params.push(id);
  }
  if (predioId) {
    condiciones.push('e.predio_id = ?');
    params.push(predioId);
  }
  if (estado) {
    condiciones.push('e.estado = ?');
    params.push(estado);
  }
  if (search) {
    condiciones.push('(p.nombre LIKE ? OR u.nombre LIKE ? OR e.observaciones LIKE ?)');
    const q = `%${search}%`;
    params.push(q, q, q);
  }

  const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
  params.push(limit);

  const [rows] = await pool.query(
    `SELECT e.*,
            p.nombre AS predio_nombre,
            p.especie AS predio_especie,
            p.sistema_productivo AS predio_sistema_productivo,
            u.nombre AS evaluador_nombre
     FROM evaluaciones e
     JOIN predios p ON p.id = e.predio_id
     LEFT JOIN usuarios u ON u.id = e.evaluador_id
     ${where}
     ORDER BY e.created_at DESC, e.id DESC
     LIMIT ?`,
    params,
  );

  return res.json(
    rows.map((evaluacion) => ({
      ...evaluacion,
      puntaje_total: evaluacion.puntaje_total === null ? null : Number(evaluacion.puntaje_total),
    })),
  );
});

export const crearEvaluacion = ah(async (req, res) => {
  const { predio_id, fecha, observaciones } = req.body ?? {};

  if (!predio_id) {
    return res.status(400).json({ error: 'El predio es obligatorio' });
  }

  const predio = await obtenerPredioCompleto(Number(predio_id));
  if (!predio) {
    return res.status(404).json({ error: 'Predio no encontrado' });
  }
  if (req.usuario.rol === 'RESPONSABLE' && predio.responsable_id !== req.usuario.id) {
    return res.status(403).json({ error: 'No tienes acceso a este predio' });
  }

  const [indicadores] = await pool.query('SELECT * FROM indicadores ORDER BY numero ASC, id ASC');
  const aplicables = indicadores.filter((indicador) => aplicaIndicador(indicador, predio));

  const fechaEvaluacion = fecha || new Date().toISOString().slice(0, 10);

  const conn = await pool.getConnection();
  let evaluacionId;
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO evaluaciones (predio_id, evaluador_id, fecha, estado, observaciones)
       VALUES (?, ?, ?, 'BORRADOR', ?)`,
      [predio.id, req.usuario.id, fechaEvaluacion, observaciones?.trim() || null],
    );
    evaluacionId = result.insertId;

    for (const indicador of aplicables) {
      await conn.query(
        `INSERT INTO item_evaluacion
           (evaluacion_id, indicador_id, numero, nombre, descripcion, metodo_evaluacion,
            libertad_id, libertad_nombre, libertad_peso, seccion,
            criterio_100, criterio_55, criterio_20, criterio_0, puntaje, observacion)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL)`,
        [
          evaluacionId,
          indicador.id,
          indicador.numero,
          indicador.nombre,
          indicador.descripcion,
          indicador.metodo_evaluacion,
          indicador.libertad_id,
          indicador.libertad_nombre,
          indicador.libertad_peso,
          null,
          indicador.criterio_100,
          indicador.criterio_55,
          indicador.criterio_20,
          indicador.criterio_0,
        ],
      );
    }

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }

  const detalle = await construirDetalle(evaluacionId);
  return res.status(201).json(detalle);
});

export const obtenerEvaluacion = ah(async (req, res) => {
  const detalle = await construirDetalle(Number(req.params.id));

  if (!detalle) {
    return res.status(404).json({ error: 'Evaluación no encontrada' });
  }
  if (!puedeVerEvaluacion(req.usuario, detalle)) {
    return res.status(403).json({ error: 'No tienes acceso a esta evaluación' });
  }

  return res.json(detalle);
});

export const actualizarEvaluacion = ah(async (req, res) => {
  const evaluacionId = Number(req.params.id);

  const [evaluaciones] = await pool.query('SELECT estado FROM evaluaciones WHERE id = ? LIMIT 1', [
    evaluacionId,
  ]);
  if (!evaluaciones[0]) {
    return res.status(404).json({ error: 'Evaluación no encontrada' });
  }
  const estabaCerrada = evaluaciones[0].estado === 'CERRADA';
  const reabrir = async () => {
    if (estabaCerrada) {
      await pool.query(
        "UPDATE evaluaciones SET estado = 'BORRADOR', puntaje_total = NULL, clasificacion = NULL, cerrada_en = NULL WHERE id = ?",
        [evaluacionId],
      );
    }
  };

  // Actualización de la cabecera (observaciones generales).
  if (req.body && Object.prototype.hasOwnProperty.call(req.body, 'observaciones')) {
    const observaciones =
      typeof req.body.observaciones === 'string' ? req.body.observaciones.trim() || null : null;
    await pool.query('UPDATE evaluaciones SET observaciones = ? WHERE id = ?', [
      observaciones,
      evaluacionId,
    ]);
    await reabrir();
    return res.json({ ok: true, observaciones });
  }

  // Actualización masiva de ítems (compatibilidad).
  const { items } = req.body ?? {};
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Se requiere el arreglo de items' });
  }

  for (const item of items) {
    const puntaje =
      item.puntaje === null || item.puntaje === undefined ? null : String(item.puntaje);
    if (puntaje !== null && !PUNTAJES_VALIDOS.has(puntaje)) continue;
    await pool.query(
      'UPDATE item_evaluacion SET puntaje = ?, observacion = ? WHERE evaluacion_id = ? AND indicador_id = ?',
      [puntaje, item.observacion ?? null, evaluacionId, item.indicador_id],
    );
  }
  await reabrir();

  return res.json({ ok: true, mensaje: 'Evaluación actualizada' });
});

export const actualizarItemEvaluacion = ah(async (req, res) => {
  const evaluacionId = Number(req.params.id);
  const indicadorId = Number(req.params.indicadorId);

  const [evaluaciones] = await pool.query('SELECT estado FROM evaluaciones WHERE id = ? LIMIT 1', [
    evaluacionId,
  ]);
  if (!evaluaciones[0]) {
    return res.status(404).json({ error: 'Evaluación no encontrada' });
  }
  const estabaCerrada = evaluaciones[0].estado === 'CERRADA';

  const [items] = await pool.query(
    'SELECT * FROM item_evaluacion WHERE evaluacion_id = ? AND indicador_id = ? LIMIT 1',
    [evaluacionId, indicadorId],
  );
  const item = items[0];
  if (!item) {
    return res.status(404).json({ error: 'El indicador no pertenece a esta evaluación' });
  }

  let puntaje = item.puntaje;
  if (Object.prototype.hasOwnProperty.call(req.body ?? {}, 'puntaje')) {
    const valor = req.body.puntaje;
    puntaje = valor === null || valor === undefined || valor === '' ? null : String(valor);
    if (puntaje !== null && !PUNTAJES_VALIDOS.has(puntaje)) {
      return res.status(400).json({ error: 'Puntaje inválido. Use 0, 20, 55 o 100.' });
    }
  }

  let observacion = item.observacion;
  if (Object.prototype.hasOwnProperty.call(req.body ?? {}, 'observacion')) {
    const texto = req.body.observacion;
    observacion = typeof texto === 'string' ? texto.trim() || null : null;
  }

  await pool.query('UPDATE item_evaluacion SET puntaje = ?, observacion = ? WHERE id = ?', [
    puntaje,
    observacion,
    item.id,
  ]);

  if (estabaCerrada) {
    await pool.query(
      "UPDATE evaluaciones SET estado = 'BORRADOR', puntaje_total = NULL, clasificacion = NULL, cerrada_en = NULL WHERE id = ?",
      [evaluacionId],
    );
  }

  const detalle = await construirDetalle(evaluacionId);
  const actualizado = detalle.items.find((i) => i.indicador_id === indicadorId);

  return res.json({ item: actualizado, resumen: detalle.resumen });
});

export const cerrarEvaluacion = ah(async (req, res) => {
  const evaluacionId = Number(req.params.id);
  const detalle = await construirDetalle(evaluacionId);

  if (!detalle) {
    return res.status(404).json({ error: 'Evaluación no encontrada' });
  }
  if (!puedeVerEvaluacion(req.usuario, detalle)) {
    return res.status(403).json({ error: 'No tienes acceso a esta evaluación' });
  }
  if (detalle.estado === 'CERRADA') {
    return res.status(400).json({ error: 'La evaluación ya está cerrada' });
  }

  const pendientes = detalle.items.filter((item) => item.puntaje === null);
  if (pendientes.length > 0) {
    return res.status(400).json({
      error: 'Hay indicadores pendientes de calificar',
      pendientes: pendientes.map((item) => ({ indicador_id: item.indicador_id, nombre: item.nombre })),
    });
  }

  const puntajeTotal = detalle.resumen.libertades
    .filter((libertad) => libertad.puntaje !== null)
    .reduce((total, libertad) => total + libertad.puntaje * libertad.peso, 0);
  const clasificacion = clasificar(puntajeTotal);

  await pool.query(
    `UPDATE evaluaciones
     SET estado = 'CERRADA', puntaje_total = ?, clasificacion = ?, cerrada_en = NOW()
     WHERE id = ?`,
    [puntajeTotal, clasificacion, evaluacionId],
  );

  const actualizado = await construirDetalle(evaluacionId);
  return res.json(actualizado);
});

export const borrarEvaluacion = ah(async (req, res) => {
  const evaluacionId = Number(req.params.id);
  const detalle = await construirDetalle(evaluacionId);

  if (!detalle) {
    return res.status(404).json({ error: 'Evaluación no encontrada' });
  }
  if (!puedeVerEvaluacion(req.usuario, detalle)) {
    return res.status(403).json({ error: 'No tienes acceso a esta evaluación' });
  }

  const motivo = (req.body?.motivo || '').trim() || 'Sin especificar';

  // Guardar el motivo en la tabla de auditoría antes de borrar
  await pool.query(
    `INSERT INTO evaluaciones_borradas (evaluacion_id, motivo) VALUES (?, ?)`,
    [evaluacionId, motivo],
  );

  await pool.query(
    `DELETE FROM item_evaluacion WHERE evaluacion_id = ?`,
    [evaluacionId],
  );
  await pool.query(
    `DELETE FROM evaluaciones WHERE id = ?`,
    [evaluacionId],
  );
  // También borramos la recomendación IA si existe
  await pool.query(
    `DELETE FROM recomendaciones_ia WHERE evaluacion_id = ?`,
    [evaluacionId],
  );

  return res.json({ mensaje: 'Evaluación borrada permanentemente.', motivo });
});

export const listarBorradas = ah(async (req, res) => {
  const [filas] = await pool.query(
    'SELECT id, evaluacion_id, motivo, fecha_borrado FROM evaluaciones_borradas ORDER BY fecha_borrado DESC'
  );
  res.json(filas);
});

export const obtenerRecomendacionIA = ah(async (req, res) => {
  const evaluacionId = Number(req.params.id);
  const detalle = await construirDetalle(evaluacionId);

  if (!detalle) {
    return res.status(404).json({ error: 'Evaluación no encontrada' });
  }
  if (!puedeVerEvaluacion(req.usuario, detalle)) {
    return res.status(403).json({ error: 'No tienes acceso a esta evaluación' });
  }

  const [existentes] = await pool.query(
    'SELECT * FROM recomendaciones_ia WHERE evaluacion_id = ? LIMIT 1',
    [evaluacionId],
  );
  let recomendacion = existentes[0];

  if (!recomendacion) {
    const generada = generarRecomendacionIA(detalle);
    const [result] = await pool.query(
      'INSERT INTO recomendaciones_ia (evaluacion_id, contenido, modelo) VALUES (?, ?, ?)',
      [evaluacionId, generada.contenido, generada.modelo],
    );
    const [nuevas] = await pool.query('SELECT * FROM recomendaciones_ia WHERE id = ? LIMIT 1', [
      result.insertId,
    ]);
    recomendacion = nuevas[0];
  }

  return res.json({ recomendacion, modelo: recomendacion.modelo });
});

export const regenerarRecomendacionIA = ah(async (req, res) => {
  const evaluacionId = Number(req.params.id);
  const detalle = await construirDetalle(evaluacionId);

  if (!detalle) {
    return res.status(404).json({ error: 'Evaluación no encontrada' });
  }
  if (!puedeVerEvaluacion(req.usuario, detalle)) {
    return res.status(403).json({ error: 'No tienes acceso a esta evaluación' });
  }

  const generada = generarRecomendacionIA(detalle);

  await pool.query(
    `INSERT INTO recomendaciones_ia (evaluacion_id, contenido, modelo)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE contenido = VALUES(contenido), modelo = VALUES(modelo)`,
    [evaluacionId, generada.contenido, generada.modelo],
  );

  const [rows] = await pool.query(
    'SELECT * FROM recomendaciones_ia WHERE evaluacion_id = ? LIMIT 1',
    [evaluacionId],
  );

  return res.json({ recomendacion: rows[0], modelo: rows[0].modelo, regenerado: true });
});

export const descargarReportePDF = ah(async (req, res) => {
  const detalle = await construirDetalle(Number(req.params.id));

  if (!detalle) {
    return res.status(404).json({ error: 'Evaluación no encontrada' });
  }
  if (!puedeVerEvaluacion(req.usuario, detalle)) {
    return res.status(403).json({ error: 'No tienes acceso a esta evaluación' });
  }

  const buffer = await generarReportePDF(detalle);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=reporte-eba-${detalle.id}.pdf`);
  return res.send(buffer);
});
