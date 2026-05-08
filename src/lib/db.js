import mysql from "mysql2/promise"

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port:process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
})

export async function testDB_Conexion(){

    try{
        const conn = await pool.getConnection()
        console.log("Conexion a DB ecsitosa")
    }catch(error){
        console.log("Error en la conection tonto: "+ error)
    }
}

export default pool