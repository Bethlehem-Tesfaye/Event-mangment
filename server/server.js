import dotenv from 'dotenv'
dotenv.config();
import express, { json } from 'express'
import conn from './db/db.js'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import userRouter from './routes/userRoutes.js';
import eventRouter from './routes/eventRoutes.js';
const port = process.env.PORT || 4000

const app = express();
app.use(express.json())
app.use(cors())
app.use(cookieParser())
app.use(cors({
    origin:"http://localhost:5173",
    credentials: true,
}))

app.get('/', (req,res)=>{
    res.send('server works!!!');
})
app.use('/api/user', userRouter)
app.use('/api/event', eventRouter)

conn.query('SELECT 1').then(()=>{
    console.log("database connected");
    app.listen(port, ()=>{
    console.log(`server running on port ${port}`);
    
})
}).catch((err)=>{
    console.log('database connection failed', err);
    
})