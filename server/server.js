import dotenv from 'dotenv'
dotenv.config();
import express, { json } from 'express'
import conn from './db/db.js'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import userRouter from './routes/userRoutes.js';
import eventRouter from './routes/eventRoutes.js';
import errorMiddleware from './middleware/errorMiddleware.js';
import authRouter from './routes/authRoutes.js';
const port = process.env.PORT || 4000

const app = express();
app.use(cors({
    origin: process.env.CLIENT_URL || true,
    credentials: true,
}))
app.use(cookieParser())
app.use(express.json())


app.get('/', (req,res)=>{
    res.send('server works!!!');
})
app.use('/api/auth', authRouter)
app.use('/api/users', userRouter)
app.use('/api/events', eventRouter)
app.use(errorMiddleware)

conn.query('SELECT 1').then(()=>{
    console.log("database connected");
    app.listen(port, ()=>{
    console.log(`server running on port ${port}`);
    
})
}).catch((err)=>{
    console.log('database connection failed', err);
    
})