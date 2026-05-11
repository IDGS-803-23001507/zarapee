import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "michelle1304",
  database: "Zarapeee",
});

export default pool;