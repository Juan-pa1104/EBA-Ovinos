import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3307),
  user: process.env.DB_USER || 'eba_user',
  password: process.env.DB_PASSWORD || 'eba_password',
  database: process.env.DB_NAME || 'eba_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  decimalNumbers: true,
  dateStrings: true,
});

// Probar la conexión al iniciar
pool
  .getConnection()
  .then((conn) => {
    console.log('✅ Conectado a MariaDB');
    conn.release();
  })
  .catch((err) => {
    console.error('❌ Error conectando a MariaDB:', err.message);
  });
