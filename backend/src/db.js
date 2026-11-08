const mysql = require('mysql2/promise');
require('dotenv').config();

// ============================================================
// POOL DE CONEXIONES A MariaDB / MySQL
// ============================================================
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ica_bienestar_animal',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4',
    timezone: '-05:00', // Colombia
    dateStrings: false,
    // Permite ejecutar procedimientos con múltiples sentencias si fuese necesario
    multipleStatements: false
});

// Verifica la conexión al iniciar
async function testConnection() {
    try {
        const conn = await pool.getConnection();
        const [rows] = await conn.query('SELECT VERSION() AS version, DATABASE() AS db');
        conn.release();
        console.log(`✅ Conectado a la base de datos "${rows[0].db}" (MySQL/MariaDB ${rows[0].version})`);
        return true;
    } catch (err) {
        console.error('❌ Error de conexión a la base de datos:');
        console.error(`   ${err.message}`);
        console.error('   Revisa el archivo .env (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME).');
        return false;
    }
}

module.exports = { pool, testConnection };
