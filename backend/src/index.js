import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import './config/db.js';
import authRoutes from './routes/auth.js';
import predioRoutes from './routes/predios.js';
import indicadorRoutes from './routes/indicadores.js';
import libertadRoutes from './routes/libertades.js';
import evaluacionRoutes from './routes/evaluaciones.js';
import usuarioRoutes from './routes/usuarios.js';
import historialRoutes from './routes/historial.js';
import dashboardRoutes from './routes/dashboard.js';
import asistenteRoutes from './routes/asistente.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

const esProduccion = process.env.NODE_ENV === 'production';
const origenesDev = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174'];
const origenesProd = (process.env.CORS_ORIGINS || '').split(',').map((o) => o.trim()).filter(Boolean);
const origenesPermitidos = esProduccion ? origenesProd : origenesDev;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (origenesPermitidos.includes(origin)) return callback(null, true);
      return callback(new Error('Origen no permitido por CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  }),
);
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/predios', predioRoutes);
app.use('/api/indicadores', indicadorRoutes);
app.use('/api/libertades', libertadRoutes);
app.use('/api/evaluaciones', evaluacionRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/historial', historialRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/asistente', asistenteRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, servicio: 'eba-backend', timestamp: new Date().toISOString() });
});

app.use((err, _req, res, _next) => {
  if (err?.message === 'Origen no permitido por CORS') {
    return res.status(403).json({ error: 'Origen no permitido por CORS' });
  }
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`🚀 EBA Backend corriendo en http://localhost:${PORT}`);
  console.log(`📖 Salud: http://localhost:${PORT}/api/health`);
});
