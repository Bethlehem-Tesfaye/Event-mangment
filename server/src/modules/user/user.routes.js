import express from "express";
import passport from "passport";
import * as userController from "./user.controller.js";
import {
  registerSchema,
  loginSchema,
  changePasswordSchema
} from "./user.schema.js";
import { validate } from "../../middleware/validate.js";
import authMiddleware from "../../middleware/authMiddleware.js";
import optionalAuthMiddleware from "../../middleware/optionalAuthMiddleware.js";
import "../../lib/passport.js";

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

// Start Google login
userRoutes.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google callback
userRoutes.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  userController.googleCallback
);

export default userRoutes;
