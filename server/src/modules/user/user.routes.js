import express from "express";
import * as userController from "./user.controller.js";
import {
  registerSchema,
  loginSchema,
  changePasswordSchema
} from "./user.schema.js";
import { validate } from "../../middleware/validate.js";
import authMiddleware from "../../middleware/authMiddleware.js";
import optionalAuthMiddleware from "../../middleware/optionalAuthMiddleware.js";

const userRoutes = express.Router();

userRoutes.post("/register", validate(registerSchema), userController.register);

userRoutes.post("/login", validate(loginSchema), userController.login);

userRoutes.post("/logout", authMiddleware, userController.logout);

userRoutes.post("/refresh", userController.refresh);

userRoutes.get("/me", optionalAuthMiddleware, userController.me);

// change password
userRoutes.post(
  "/change-password",
  authMiddleware,
  validate(changePasswordSchema),
  userController.changePassword
);

userRoutes.get("/verify-email", userController.verifyEmailController);
userRoutes.post("/verify-email/resend", userController.resendVerifyController);

export default userRoutes;
