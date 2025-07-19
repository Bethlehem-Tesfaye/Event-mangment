import express from "express";
import { getProfile, setProfile } from "../controllers/userControllers.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { profileSchema } from "../schemas/userSchema.js";

const userRouter = express.Router();

userRouter.get("/profile", authMiddleware, getProfile);
userRouter.put("/profile", authMiddleware, validate(profileSchema), setProfile);

export default userRouter;
