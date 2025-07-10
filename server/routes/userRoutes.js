import express from 'express'
import { getProfile, login, logout, register, setProfile } from '../controllers/userControllers.js';
import userMiddleware from '../middleware/userMiddleware.js';

const userRouter = express.Router();

userRouter.post('/register', register)
userRouter.post('/login', login)
userRouter.post('/logout', logout)
userRouter.get('/user-profile', userMiddleware,getProfile)
userRouter.put('/user-profile', userMiddleware,setProfile)


export default userRouter