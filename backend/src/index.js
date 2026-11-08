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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/predios', predioRoutes);
app.use('/api/indicadores', indicadorRoutes);
app.use('/api/libertades', libertadRoutes);
app.use('/api/evaluaciones', evaluacionRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/historial', historialRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, servicio: 'eba-backend', timestamp: new Date().toISOString() });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`🚀 EBA Backend corriendo en http://localhost:${PORT}`);
  console.log(`📖 Salud: http://localhost:${PORT}/api/health`);
});
