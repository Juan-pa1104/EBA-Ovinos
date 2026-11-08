import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'eba_super_secreto_cambiar_en_produccion';

export function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticación requerido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.usuario = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

export function autorizarRoles(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ error: 'Autenticación requerida' });
    }
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'No tienes permiso para esta acción' });
    }
    next();
  };
}

export function generarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}
