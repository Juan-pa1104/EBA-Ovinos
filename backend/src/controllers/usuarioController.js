import { pool } from '../config/db.js';
import { ah } from '../utils/asyncHandler.js';

const ROLES = ['ADMIN', 'EVALUADOR', 'RESPONSABLE'];
const CAMPOS_PUBLICOS = 'id, nombre, correo, rol, activo, created_at, updated_at';

function usuarioPublico(usuario) {
  if (!usuario) return null;
  return { ...usuario, activo: Boolean(usuario.activo) };
}

export const listarUsuarios = ah(async (req, res) => {
  const { rol, search } = req.query;

  const condiciones = [];
  const params = [];

  if (rol && ROLES.includes(rol)) {
    condiciones.push('rol = ?');
    params.push(rol);
  }
  if (search) {
    condiciones.push('(nombre LIKE ? OR correo LIKE ?)');
    const q = `%${search}%`;
    params.push(q, q);
  }

  const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
  const [rows] = await pool.query(
    `SELECT ${CAMPOS_PUBLICOS} FROM usuarios ${where} ORDER BY nombre ASC, id ASC`,
    params,
  );

  return res.json(rows.map(usuarioPublico));
});

export const listarResponsables = ah(async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT id, nombre, correo FROM usuarios
     WHERE rol = 'RESPONSABLE' AND activo = 1
     ORDER BY nombre ASC`,
  );
  return res.json(rows);
});

export const crearUsuario = ah(async (req, res) => {
  const { nombre, correo, password, rol, activo } = req.body ?? {};

  if (!nombre || !correo || !password || !rol) {
    return res.status(400).json({ error: 'Nombre, correo, contraseña y rol son requeridos' });
  }
  if (!ROLES.includes(rol)) {
    return res.status(400).json({ error: 'Rol inválido' });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  const correoLimpio = String(correo).trim().toLowerCase();
  const [existentes] = await pool.query('SELECT id FROM usuarios WHERE LOWER(correo) = ? LIMIT 1', [
    correoLimpio,
  ]);
  if (existentes.length > 0) {
    return res.status(409).json({ error: 'Ya existe un usuario con ese correo' });
  }

  const [result] = await pool.query(
    `INSERT INTO usuarios (nombre, correo, password, rol, activo)
     VALUES (?, ?, ?, ?, ?)`,
    [String(nombre).trim(), correoLimpio, password, rol, activo === false ? 0 : 1],
  );

  const [rows] = await pool.query(`SELECT ${CAMPOS_PUBLICOS} FROM usuarios WHERE id = ?`, [
    result.insertId,
  ]);
  return res.status(201).json(usuarioPublico(rows[0]));
});

export const actualizarUsuario = ah(async (req, res) => {
  const usuarioId = Number(req.params.id);

  const [existentes] = await pool.query('SELECT * FROM usuarios WHERE id = ? LIMIT 1', [usuarioId]);
  const actual = existentes[0];

  if (!actual) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  const { nombre, correo, password, rol, activo } = req.body ?? {};

  if (rol !== undefined && !ROLES.includes(rol)) {
    return res.status(400).json({ error: 'Rol inválido' });
  }
  if (password !== undefined && password !== '' && String(password).length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  const correoLimpio = correo !== undefined ? String(correo).trim().toLowerCase() : actual.correo;
  if (correoLimpio !== actual.correo) {
    const [duplicados] = await pool.query(
      'SELECT id FROM usuarios WHERE LOWER(correo) = ? AND id <> ? LIMIT 1',
      [correoLimpio, usuarioId],
    );
    if (duplicados.length > 0) {
      return res.status(409).json({ error: 'Ya existe un usuario con ese correo' });
    }
  }

  await pool.query(
    `UPDATE usuarios SET nombre = ?, correo = ?, password = ?, rol = ?, activo = ?
     WHERE id = ?`,
    [
      nombre ?? actual.nombre,
      correoLimpio,
      password !== undefined && password !== '' ? password : actual.password,
      rol ?? actual.rol,
      activo !== undefined ? (activo ? 1 : 0) : actual.activo,
      usuarioId,
    ],
  );

  const [rows] = await pool.query(`SELECT ${CAMPOS_PUBLICOS} FROM usuarios WHERE id = ?`, [usuarioId]);
  return res.json(usuarioPublico(rows[0]));
});

export const cambiarEstadoUsuario = ah(async (req, res) => {
  const usuarioId = Number(req.params.id);
  const { activo } = req.body ?? {};

  if (typeof activo !== 'boolean') {
    return res.status(400).json({ error: 'El campo activo debe ser booleano' });
  }

  const [result] = await pool.query('UPDATE usuarios SET activo = ? WHERE id = ?', [
    activo ? 1 : 0,
    usuarioId,
  ]);
  if (!result.affectedRows) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  const [rows] = await pool.query(`SELECT ${CAMPOS_PUBLICOS} FROM usuarios WHERE id = ?`, [usuarioId]);
  return res.json(usuarioPublico(rows[0]));
});

export const asignarPredios = ah(async (req, res) => {
  const usuarioId = Number(req.params.id);
  const { predioIds } = req.body ?? {};

  if (!Array.isArray(predioIds)) {
    return res.status(400).json({ error: 'El campo predioIds debe ser un arreglo' });
  }

  const [usuarios] = await pool.query('SELECT id, rol FROM usuarios WHERE id = ? LIMIT 1', [usuarioId]);
  if (!usuarios[0]) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }
  if (usuarios[0].rol !== 'RESPONSABLE') {
    return res.status(400).json({ error: 'Solo se pueden asignar predios a usuarios con rol RESPONSABLE' });
  }

  const ids = [...new Set(predioIds.map(Number).filter((id) => Number.isInteger(id) && id > 0))];

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Quitar la asignación de los predios que ya no estén seleccionados.
    await conn.query('UPDATE predios SET responsable_id = NULL WHERE responsable_id = ?', [usuarioId]);

    if (ids.length > 0) {
      const marcadores = ids.map(() => '?').join(', ');
      await conn.query(
        `UPDATE predios SET responsable_id = ? WHERE id IN (${marcadores})`,
        [usuarioId, ...ids],
      );
    }

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }

  return res.json({ ok: true, usuario_id: usuarioId, predioIds: ids });
});
