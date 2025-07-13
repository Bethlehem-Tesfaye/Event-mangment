import dotenv from 'dotenv'
dotenv.config();
import pg from 'pg'

const {Pool} = pg

const conn = new Pool({
    connectionString: process.env.DATABASE_URL,
})

export default conn