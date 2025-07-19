import express from "express";
import { login, logout, register } from "../controllers/userControllers.js";
import { validate } from "../middleware/validate.js";
import { loginSchema, registerSchema } from "../schemas/authSchema.js";

const authRouter = express.Router();

authRouter.post("/register", validate(registerSchema), register);
authRouter.post("/login", validate(loginSchema), login);
authRouter.post("/logout", logout);

export default authRouter;
