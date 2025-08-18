import express from "express";
import * as profileController from "./profile.controller.js";
import { profileSchema } from "./profile.schema.js";
import { validate } from "../../middleware/validate.js";
import authMiddleware from "../../middleware/authMiddleware.js";

const profileRoutes = express.Router();

profileRoutes.get("/", authMiddleware, profileController.getProfile);

profileRoutes.put(
  "/",
  authMiddleware,
  validate(profileSchema),
  profileController.setProfile
);

export default profileRoutes;
