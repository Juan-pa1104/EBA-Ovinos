// ============================================================
// SERVIDOR PRINCIPAL - ICA BIENESTAR ANIMAL
// API REST + Sirve el frontend unificado (multi-especie)
// ============================================================
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const apiRoutes = require('./routes/api');
const { testConnection } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Middlewares ----------
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ---------- Carpetas estáticas ----------
const uploadDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', express.static(uploadDir));

// Servir el frontend (carpeta /public)
app.use(express.static(path.join(__dirname, '..', 'public')));

// Servir los recursos descargables existentes (SQL y documentos)
const raizProyecto = path.join(__dirname, '..', '..');
app.use('/recursos', express.static(raizProyecto));

// ---------- Rutas API ----------
app.use('/api', apiRoutes);

// ---------- Ruta raíz ----------
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// ---------- Manejo de errores global ----------
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    res.status(err.status || 500).json({
        ok: false,
        error: err.sqlMessage || err.message || 'Error interno del servidor'
    });
});

// ---------- 404 ----------
app.use((req, res) => {
    res.status(404).json({ ok: false, error: 'Ruta no encontrada' });
});

// ---------- Arranque ----------
(async () => {
    const conectado = await testConnection();
    app.listen(PORT, () => {
        console.log('');
        console.log('============================================================');
        console.log('  🐑🐖  SISTEMA ICA BIENESTAR ANIMAL - API V3.0');
        console.log('============================================================');
        console.log(`  🌐 Servidor:   http://localhost:${PORT}`);
        console.log(`  🔌 API:        http://localhost:${PORT}/api`);
        console.log(`  💾 Base datos: ${process.env.DB_NAME || 'ica_bienestar_animal'}`);
        console.log(`  ✅ Estado BD:  ${conectado ? 'conectada' : 'SIN CONEXIÓN (revisa .env)'}`);
        console.log('============================================================');
        console.log('');
    });
})();
