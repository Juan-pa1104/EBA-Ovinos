import { pool } from '../config/db.js';

/**
 * Utilidad centralizada de permisos para EBA Assistant.
 *
 * - Solo lee identificadores desde el JWT (req.usuario), nunca desde body/query del cliente.
 * - Todas las consultas son parametrizadas con `?` (mysql2).
 * - No modifica permisos generales existentes de /predios y /evaluaciones; solo se usará en el asistente.
 */

export function esAdmin(usuario) {
  return usuario?.rol === 'ADMIN';
}

export function esEvaluador(usuario) {
  return usuario?.rol === 'EVALUADOR';
}

export function esResponsable(usuario) {
  return usuario?.rol === 'RESPONSABLE';
}

function validarAlias(alias, defecto) {
  if (typeof alias !== 'string') return defecto;
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(alias)) return defecto;
  return alias;
}

/**
 * Evalúa en memoria si un usuario puede consultar un predio ya cargado.
 *
 * @param {object} usuario - Decodificado JWT { id, rol }
 * @param {object} predio - Predio con responsable_id / creado_por (y opcional flags)
 * @param {object} [opciones]
 * @param {boolean} [opciones.tieneEvaluacionAsignada] - true si existe evaluacion con evaluador_id = usuario.id en ese predio
 * @returns {boolean}
 */
export function puedeConsultarPredio(usuario, predio, opciones = {}) {
  if (!usuario || !predio) return false;
  if (esAdmin(usuario)) return true;

  if (esResponsable(usuario)) {
    return predio.responsable_id === usuario.id;
  }

  if (esEvaluador(usuario)) {
    if (predio.creado_por === usuario.id) return true;
    if (predio.responsable_id === usuario.id) return true;
    if (opciones.tieneEvaluacionAsignada === true) return true;
    if (predio.tieneEvaluacionAsignada === true) return true;
    if (predio.evaluador_id === usuario.id) return true;
    return false;
  }

  return false;
}

/**
 * Evalúa en memoria si un usuario puede consultar una evaluación.
 *
 * Formatos aceptados:
 * - Detalle de construirDetalle(): { evaluador_id, predio: { responsable_id, creado_por } }
 * - Objeto plano con JOIN: { evaluador_id, responsable_id, creado_por } o { evaluador_id, predio_responsable_id, predio_creado_por }
 */
export function puedeConsultarEvaluacion(usuario, evaluacion) {
  if (!usuario || !evaluacion) return false;
  if (esAdmin(usuario)) return true;

  const predio = evaluacion.predio ?? {};
  const responsableId = predio.responsable_id ?? evaluacion.responsable_id ?? evaluacion.predio_responsable_id;
  const creadoPor = predio.creado_por ?? evaluacion.creado_por ?? evaluacion.predio_creado_por;
  const evaluadorId = evaluacion.evaluador_id;

  if (esResponsable(usuario)) {
    return responsableId === usuario.id;
  }

  if (esEvaluador(usuario)) {
    return (
      evaluadorId === usuario.id ||
      creadoPor === usuario.id ||
      responsableId === usuario.id
    );
  }

  return false;
}

/**
 * Verifica contra BD si el usuario puede ver un predio por su ID.
 * Usa solo el `id` del JWT (req.usuario.id), nunca IDs libres del cliente para el permiso.
 *
 * @returns {Promise<boolean>}
 */
export async function puedeVerPredioPorId(usuario, predioId) {
  const idNum = Number(predioId);
  if (!usuario || !Number.isFinite(idNum) || idNum <= 0) return false;

  let rows;
  if (esAdmin(usuario)) {
    [rows] = await pool.query('SELECT 1 AS ok FROM predios WHERE id = ? LIMIT 1', [idNum]);
  } else if (esResponsable(usuario)) {
    [rows] = await pool.query('SELECT 1 AS ok FROM predios WHERE id = ? AND responsable_id = ? LIMIT 1', [
      idNum,
      usuario.id,
    ]);
  } else if (esEvaluador(usuario)) {
    [rows] = await pool.query(
      `SELECT 1 AS ok
       FROM predios p
       WHERE p.id = ?
         AND (
           p.creado_por = ?
           OR p.responsable_id = ?
           OR EXISTS (SELECT 1 FROM evaluaciones e WHERE e.predio_id = p.id AND e.evaluador_id = ?)
         )
       LIMIT 1`,
      [idNum, usuario.id, usuario.id, usuario.id],
    );
  } else {
    return false;
  }
  return rows.length > 0;
}

/**
 * Verifica contra BD si el usuario puede ver una evaluación por su ID (JOIN con predio).
 *
 * @returns {Promise<boolean>}
 */
export async function puedeVerEvaluacionPorId(usuario, evaluacionId) {
  const idNum = Number(evaluacionId);
  if (!usuario || !Number.isFinite(idNum) || idNum <= 0) return false;

  let rows;
  if (esAdmin(usuario)) {
    [rows] = await pool.query('SELECT 1 AS ok FROM evaluaciones WHERE id = ? LIMIT 1', [idNum]);
  } else if (esResponsable(usuario)) {
    [rows] = await pool.query(
      `SELECT 1 AS ok
       FROM evaluaciones e
       JOIN predios p ON p.id = e.predio_id
       WHERE e.id = ? AND p.responsable_id = ?
       LIMIT 1`,
      [idNum, usuario.id],
    );
  } else if (esEvaluador(usuario)) {
    [rows] = await pool.query(
      `SELECT 1 AS ok
       FROM evaluaciones e
       JOIN predios p ON p.id = e.predio_id
       WHERE e.id = ?
         AND (e.evaluador_id = ? OR p.creado_por = ? OR p.responsable_id = ?)
       LIMIT 1`,
      [idNum, usuario.id, usuario.id, usuario.id],
    );
  } else {
    return false;
  }
  return rows.length > 0;
}

/**
 * Genera la condición SQL parametrizada para filtrar predios autorizados.
 * Uso: `WHERE ${condicion.sql}` con `...condicion.params`
 * Alias validado para evitar inyección en el nombre de columna.
 *
 * @returns {{ sql: string, params: Array }}
 */
export function condicionPredioAutorizado(usuario, alias = 'p') {
  const a = validarAlias(alias, 'p');
  if (!usuario) return { sql: '1 = 0', params: [] };
  if (esAdmin(usuario)) return { sql: '1 = 1', params: [] };
  if (esResponsable(usuario)) {
    return { sql: `${a}.responsable_id = ?`, params: [usuario.id] };
  }
  if (esEvaluador(usuario)) {
    return {
      sql: `(${a}.creado_por = ? OR ${a}.responsable_id = ? OR EXISTS (SELECT 1 FROM evaluaciones e WHERE e.predio_id = ${a}.id AND e.evaluador_id = ?))`,
      params: [usuario.id, usuario.id, usuario.id],
    };
  }
  return { sql: '1 = 0', params: [] };
}

/**
 * Genera la condición SQL parametrizada para filtrar evaluaciones autorizadas.
 * Requiere JOIN previo con predios usando aliasP.
 *
 * @returns {{ sql: string, params: Array }}
 */
export function condicionEvaluacionAutorizada(usuario, aliasE = 'e', aliasP = 'p') {
  const e = validarAlias(aliasE, 'e');
  const p = validarAlias(aliasP, 'p');
  if (!usuario) return { sql: '1 = 0', params: [] };
  if (esAdmin(usuario)) return { sql: '1 = 1', params: [] };
  if (esResponsable(usuario)) {
    return { sql: `${p}.responsable_id = ?`, params: [usuario.id] };
  }
  if (esEvaluador(usuario)) {
    return {
      sql: `(${e}.evaluador_id = ? OR ${p}.creado_por = ? OR ${p}.responsable_id = ?)`,
      params: [usuario.id, usuario.id, usuario.id],
    };
  }
  return { sql: '1 = 0', params: [] };
}
