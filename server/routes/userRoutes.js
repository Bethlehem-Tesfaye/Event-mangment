import express from "express";
import { getProfile, setProfile } from "../controllers/userControllers.js";
import authMiddleware from "../middleware/authMiddleware.js";

const userRouter = express.Router();

userRouter.get("/profile", authMiddleware, getProfile);
userRouter.put("/profile", authMiddleware, setProfile);

export default userRouter;
