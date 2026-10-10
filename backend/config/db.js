import { Pool } from "pg";

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})


pool.on("connect", () => { 
    console.log('connected to db')
 })

pool.on('error', (error) => { 
    console.error('DB error:', error )
 } )



export default pool