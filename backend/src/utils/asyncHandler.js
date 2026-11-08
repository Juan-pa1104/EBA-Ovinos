/**
 * Envuelve un handler async para que Express capture las promesas rechazadas
 * y las envíe al middleware de errores.
 */
export const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
