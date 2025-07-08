import dotenv from 'dotenv'
dotenv.config();
import pg from 'pg'

const {Pool} = pg

const conn = new Pool({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    port:process.env.DB_PORT,
    password:process.env.DB_PASS,
    database:process.env.DB_NAME,
})

export default conn