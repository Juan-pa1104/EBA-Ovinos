import { pool } from '../config/db.js';
import { ah } from '../utils/asyncHandler.js';
import { generarToken } from '../middleware/auth.js';

function usuarioPublico(usuario) {
  const { password: _password, ...resto } = usuario;
  return { ...resto, activo: Boolean(resto.activo) };
}

export const login = ah(async (req, res) => {
  const { correo, password } = req.body ?? {};

  if (!correo || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
  }

  const [rows] = await pool.query('SELECT * FROM usuarios WHERE LOWER(correo) = LOWER(?) LIMIT 1', [
    String(correo).trim(),
  ]);
  const usuario = rows[0];

  if (!usuario || usuario.password !== password) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  if (!usuario.activo) {
    return res.status(403).json({ error: 'La cuenta está desactivada. Contacte al administrador.' });
  }

  const token = generarToken(usuario);
  return res.json({ token, usuario: usuarioPublico(usuario) });
});

export const me = ah(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM usuarios WHERE id = ? LIMIT 1', [req.usuario.id]);

  if (!rows[0]) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  return res.json({ usuario: usuarioPublico(rows[0]) });
});
