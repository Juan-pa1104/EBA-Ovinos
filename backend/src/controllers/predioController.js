import { pool } from '../config/db.js';
import { ah } from '../utils/asyncHandler.js';

const CAMPOS_RESUMEN = `
  (SELECT e.clasificacion FROM evaluaciones e
     WHERE e.predio_id = p.id AND e.estado = 'CERRADA'
     ORDER BY e.cerrada_en DESC, e.id DESC LIMIT 1) AS ultima_clasificacion,
  (SELECT e.cerrada_en FROM evaluaciones e
     WHERE e.predio_id = p.id AND e.estado = 'CERRADA'
     ORDER BY e.cerrada_en DESC, e.id DESC LIMIT 1) AS ultima_fecha,
  (SELECT COUNT(*) FROM evaluaciones e
     WHERE e.predio_id = p.id AND e.estado = 'CERRADA') AS total_evaluaciones,
  (SELECT COUNT(*) FROM evaluaciones e
     WHERE e.predio_id = p.id AND e.estado = 'BORRADOR') AS borradores
`;

export function normalizarPredio(predio) {
  if (!predio) return null;
  return {
    ...predio,
    es_ovino_de_lana: Boolean(predio.es_ovino_de_lana),
    numero_animales: Number(predio.numero_animales ?? 0),
    total_evaluaciones: Number(predio.total_evaluaciones ?? 0),
    borradores: Number(predio.borradores ?? 0),
    responsable_nombre: predio.responsable_nombre ?? null,
    ultima_clasificacion: predio.ultima_clasificacion ?? null,
    ultima_fecha: predio.ultima_fecha ?? null,
  };
}

export async function obtenerPredioCompleto(predioId) {
  const [rows] = await pool.query(
    `SELECT p.*, u.nombre AS responsable_nombre, ${CAMPOS_RESUMEN}
     FROM predios p
     LEFT JOIN usuarios u ON u.id = p.responsable_id
     WHERE p.id = ?
     LIMIT 1`,
    [predioId],
  );
  return normalizarPredio(rows[0]);
}

function puedeVerPredio(usuario, predio) {
  if (usuario.rol !== 'RESPONSABLE') return true;
  return predio.responsable_id === usuario.id;
}

export const listarPredios = ah(async (req, res) => {
  const { rol, id } = req.usuario;
  const { search, especie, sistema } = req.query;

  const condiciones = [];
  const params = [];

  if (rol === 'RESPONSABLE') {
    condiciones.push('p.responsable_id = ?');
    params.push(id);
  }
  if (search) {
    condiciones.push('(p.nombre LIKE ? OR p.municipio LIKE ? OR p.direccion LIKE ?)');
    const q = `%${search}%`;
    params.push(q, q, q);
  }
  if (especie) {
    condiciones.push('p.especie = ?');
    params.push(especie);
  }
  if (sistema) {
    condiciones.push('p.sistema_productivo = ?');
    params.push(sistema);
  }

  const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `SELECT p.*, u.nombre AS responsable_nombre, ${CAMPOS_RESUMEN}
     FROM predios p
     LEFT JOIN usuarios u ON u.id = p.responsable_id
     ${where}
     ORDER BY p.nombre ASC, p.id ASC`,
    params,
  );

  return res.json(rows.map(normalizarPredio));
});

export const obtenerPredioPorId = ah(async (req, res) => {
  const predio = await obtenerPredioCompleto(Number(req.params.id));

  if (!predio) {
    return res.status(404).json({ error: 'Predio no encontrado' });
  }
  if (!puedeVerPredio(req.usuario, predio)) {
    return res.status(403).json({ error: 'No tienes acceso a este predio' });
  }

  return res.json(predio);
});

export const crearPredio = ah(async (req, res) => {
  const {
    nombre,
    municipio,
    direccion,
    especie,
    sistema_productivo,
    es_ovino_de_lana,
    numero_animales,
    responsable_id,
  } = req.body ?? {};

  if (!nombre || !municipio || !especie || !sistema_productivo) {
    return res.status(400).json({ error: 'Faltan campos requeridos (nombre, municipio, especie y sistema productivo)' });
  }

  const [result] = await pool.query(
    `INSERT INTO predios
       (nombre, municipio, direccion, especie, sistema_productivo, es_ovino_de_lana,
        numero_animales, responsable_id, creado_por)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      String(nombre).trim(),
      String(municipio).trim(),
      direccion || null,
      especie,
      sistema_productivo,
      es_ovino_de_lana ? 1 : 0,
      Number(numero_animales) || 0,
      responsable_id || null,
      req.usuario.id,
    ],
  );

  const predio = await obtenerPredioCompleto(result.insertId);
  return res.status(201).json(predio);
});

export const actualizarPredio = ah(async (req, res) => {
  const predioId = Number(req.params.id);
  const actual = await obtenerPredioCompleto(predioId);

  if (!actual) {
    return res.status(404).json({ error: 'Predio no encontrado' });
  }
  if (!puedeVerPredio(req.usuario, actual)) {
    return res.status(403).json({ error: 'No tienes acceso a este predio' });
  }

  const {
    nombre,
    municipio,
    direccion,
    especie,
    sistema_productivo,
    es_ovino_de_lana,
    numero_animales,
    responsable_id,
  } = req.body ?? {};

  await pool.query(
    `UPDATE predios SET
       nombre = ?, municipio = ?, direccion = ?, especie = ?, sistema_productivo = ?,
       es_ovino_de_lana = ?, numero_animales = ?, responsable_id = ?
     WHERE id = ?`,
    [
      nombre ?? actual.nombre,
      municipio ?? actual.municipio,
      direccion !== undefined ? direccion || null : actual.direccion,
      especie ?? actual.especie,
      sistema_productivo ?? actual.sistema_productivo,
      es_ovino_de_lana !== undefined ? (es_ovino_de_lana ? 1 : 0) : actual.es_ovino_de_lana ? 1 : 0,
      numero_animales !== undefined ? Number(numero_animales) || 0 : actual.numero_animales,
      responsable_id !== undefined ? responsable_id || null : actual.responsable_id,
      predioId,
    ],
  );

  const predio = await obtenerPredioCompleto(predioId);
  return res.json(predio);
});

export const eliminarPredio = ah(async (req, res) => {
  const predioId = Number(req.params.id);
  const predio = await obtenerPredioCompleto(predioId);

  if (!predio) {
    return res.status(404).json({ error: 'Predio no encontrado' });
  }
  if (!puedeVerPredio(req.usuario, predio)) {
    return res.status(403).json({ error: 'No tienes acceso a este predio' });
  }

  try {
    await pool.query('DELETE FROM predios WHERE id = ?', [predioId]);
    return res.status(204).end();
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({
        error: 'No se puede eliminar el predio porque tiene evaluaciones asociadas.',
      });
    }
    throw error;
  }
});
