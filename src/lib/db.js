import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 's02e07t05',
  database: process.env.DB_NAME || 'Zarapeee', 
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;