import { pool } from '../config/db.js';
import { ah } from '../utils/asyncHandler.js';
import { procesarChat, CONFIG } from '../utils/asistenteGemini.js';

const RATE_LIMIT_VENTANA_MS = 60_000;
const RATE_LIMIT_MAX = 20;
const intentosPorUsuario = new Map();

// Mutex por conversación (solo en esta instancia del backend, no distribuido)
const colasConversacion = new Map();

async function conBloqueoConversacion(conversacionId, fn) {
  const previo = colasConversacion.get(conversacionId) ?? Promise.resolve();
  let liberar;
  const bloque = new Promise((resolve) => { liberar = resolve; });
  const siguiente = previo.then(() => bloque);
  colasConversacion.set(conversacionId, siguiente);
  // Limpieza: si esta cola sigue siendo la actual cuando termina, se elimina
  siguiente.finally(() => {
    if (colasConversacion.get(conversacionId) === siguiente) colasConversacion.delete(conversacionId);
  });
  await previo;
  try {
    return await fn();
  } finally {
    liberar();
  }
}

function verificarRateLimit(usuarioId) {
  const ahora = Date.now();
  const arr = (intentosPorUsuario.get(usuarioId) ?? []).filter((t) => ahora - t < RATE_LIMIT_VENTANA_MS);
  if (arr.length >= RATE_LIMIT_MAX) return false;
  arr.push(ahora);
  intentosPorUsuario.set(usuarioId, arr);
  return true;
}

async function obtenerConversacionPropia(conversacionId, usuarioId) {
  const [rows] = await pool.query(
    'SELECT id, usuario_id, titulo, creado_en, actualizado_en FROM asistente_conversaciones WHERE id = ? AND usuario_id = ? LIMIT 1',
    [conversacionId, usuarioId],
  );
  return rows[0] ?? null;
}

export const crearConversacion = ah(async (req, res) => {
  const usuarioId = req.usuario.id;
  const tituloCrudo = typeof req.body?.titulo === 'string' ? req.body.titulo.trim() : '';
  const titulo = tituloCrudo ? tituloCrudo.slice(0, 255) : 'Nueva conversación';

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    const [result] = await conn.query(
      'INSERT INTO asistente_conversaciones (usuario_id, titulo) VALUES (?, ?)',
      [usuarioId, titulo],
    );
    const conversacionId = result.insertId;

    const [filas] = await conn.query(
      'SELECT id, usuario_id, titulo, creado_en, actualizado_en FROM asistente_conversaciones WHERE id = ? LIMIT 1',
      [conversacionId],
    );

    await conn.commit();
    return res.status(201).json(filas[0]);
  } catch (error) {
    if (conn) await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.release();
  }
});

export const listarConversaciones = ah(async (req, res) => {
  const usuarioId = req.usuario.id;
  const [rows] = await pool.query(
    'SELECT id, usuario_id, titulo, creado_en, actualizado_en FROM asistente_conversaciones WHERE usuario_id = ? ORDER BY actualizado_en DESC, id DESC',
    [usuarioId],
  );
  return res.json(rows);
});

export const obtenerConversacion = ah(async (req, res) => {
  const conversacionId = Number(req.params.id);
  if (!Number.isFinite(conversacionId) || conversacionId <= 0) {
    return res.status(400).json({ error: 'ID de conversación inválido' });
  }
  const conversacion = await obtenerConversacionPropia(conversacionId, req.usuario.id);
  if (!conversacion) {
    return res.status(404).json({ error: 'Conversación no encontrada' });
  }
  const [mensajes] = await pool.query(
    'SELECT id, conversacion_id, rol, contenido, creado_en FROM asistente_mensajes WHERE conversacion_id = ? ORDER BY creado_en ASC, id ASC',
    [conversacionId],
  );
  return res.json({ ...conversacion, mensajes });
});

export const listarMensajes = ah(async (req, res) => {
  const conversacionId = Number(req.params.id);
  if (!Number.isFinite(conversacionId) || conversacionId <= 0) {
    return res.status(400).json({ error: 'ID de conversación inválido' });
  }
  const conversacion = await obtenerConversacionPropia(conversacionId, req.usuario.id);
  if (!conversacion) {
    return res.status(404).json({ error: 'Conversación no encontrada' });
  }
  const [rows] = await pool.query(
    'SELECT id, conversacion_id, rol, contenido, creado_en FROM asistente_mensajes WHERE conversacion_id = ? ORDER BY creado_en ASC, id ASC',
    [conversacionId],
  );
  return res.json(rows);
});

export const eliminarConversacion = ah(async (req, res) => {
  const conversacionId = Number(req.params.id);
  if (!Number.isFinite(conversacionId) || conversacionId <= 0) {
    return res.status(400).json({ error: 'ID de conversación inválido' });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    const [result] = await conn.query(
      'DELETE FROM asistente_conversaciones WHERE id = ? AND usuario_id = ?',
      [conversacionId, req.usuario.id],
    );

    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Conversación no encontrada' });
    }

    await conn.commit();
    return res.status(204).end();
  } catch (error) {
    if (conn) await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.release();
  }
});

export const chatear = ah(async (req, res) => {
  const conversacionId = Number(req.params.id);
  if (!Number.isFinite(conversacionId) || conversacionId <= 0) {
    return res.status(400).json({ error: 'ID de conversación inválido' });
  }

  const mensajeBruto = typeof req.body?.mensaje === 'string' ? req.body.mensaje : (typeof req.body?.content === 'string' ? req.body.content : '');
  const mensaje = mensajeBruto.trim();
  if (!mensaje) {
    return res.status(400).json({ error: 'El mensaje no puede estar vacío' });
  }
  if (mensaje.length > 4000) {
    return res.status(400).json({ error: 'El mensaje es demasiado largo (máx. 4000 caracteres)' });
  }

  if (!verificarRateLimit(req.usuario.id)) {
    return res.status(429).json({ error: 'Demasiadas solicitudes. Intenta de nuevo en un momento.' });
  }

  // Serialización por conversación: propiedad -> historial -> OpenAI -> guardado
  return conBloqueoConversacion(conversacionId, async () => {
    const conversacion = await obtenerConversacionPropia(conversacionId, req.usuario.id);
    if (!conversacion) {
      return res.status(404).json({ error: 'Conversación no encontrada' });
    }

    // Historial permitido: solo de esta conversación, últimos 20
    const [historialRows] = await pool.query(
      'SELECT rol, contenido FROM asistente_mensajes WHERE conversacion_id = ? ORDER BY creado_en ASC, id ASC LIMIT 20',
      [conversacionId],
    );

    let resultado;
    try {
      resultado = await procesarChat(req.usuario, historialRows, mensaje);
    } catch (err) {
      const codigo = err.codigo || 502;
      // Log seguro: sin claves ni PII, solo código técnico de Gemini
      console.error('[asistente] Gemini error', { codigo: err.codigo, causa: err.causa, modelo: CONFIG.modelo, mensaje: err.message });
      return res.status(codigo).json({ error: err.message || 'El asistente no está disponible en este momento' });
    }

    const { respuesta, llamadas } = resultado;

    let conn;
    try {
      conn = await pool.getConnection();
      await conn.beginTransaction();

      const [rUser] = await conn.query(
        'INSERT INTO asistente_mensajes (conversacion_id, rol, contenido) VALUES (?, ?, ?)',
        [conversacionId, 'user', mensaje],
      );
      const [rAsist] = await conn.query(
        'INSERT INTO asistente_mensajes (conversacion_id, rol, contenido) VALUES (?, ?, ?)',
        [conversacionId, 'assistant', respuesta],
      );
      await conn.query(
        'UPDATE asistente_conversaciones SET actualizado_en = NOW() WHERE id = ?',
        [conversacionId],
      );
      await conn.commit();

      return res.json({
        conversacionId,
        mensajeUsuario: { id: rUser.insertId, rol: 'user', contenido: mensaje },
        respuesta: { id: rAsist.insertId, rol: 'assistant', contenido: respuesta },
        texto: respuesta,
        llamadas,
        modelo: CONFIG.modelo,
      });
    } catch (error) {
      if (conn) await conn.rollback();
      throw error;
    } finally {
      if (conn) conn.release();
    }
  });
});
