// ============================================================
// INICIALIZADOR DE BASE DE DATOS
// Ejecuta el script BaseDatos_ICA_Bienestar_MariaDB.sql
// Uso:  npm run init-db
// ============================================================
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function init() {
    const sqlFile = path.join(__dirname, '..', '..', 'BaseDatos_ICA_Bienestar_MariaDB.sql');
    if (!fs.existsSync(sqlFile)) {
        console.error(`❌ No se encontró el script SQL en: ${sqlFile}`);
        process.exit(1);
    }
    const sql = fs.readFileSync(sqlFile, 'utf8');
    console.log(`📄 Script encontrado: ${path.basename(sqlFile)}`);

    // Conexión SIN base de datos (para poder crearla)
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        multipleStatements: true
    });

    try {
        console.log('⏳ Ejecutando script SQL...');
        await conn.query(sql);
        console.log('✅ Base de datos creada e inicializada correctamente.');
        console.log(`   Nombre: ${process.env.DB_NAME || 'ica_bienestar_animal'}`);
    } catch (err) {
        console.error('❌ Error al ejecutar el script SQL:');
        console.error(`   ${err.message}`);
        process.exitCode = 1;
    } finally {
        await conn.end();
    }
}

init();
