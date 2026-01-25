import express from "express";
import * as profileController from "./profile.controller.js";
import { profileSchema } from "./profile.schema.js";
import { validate } from "../../middleware/validate.js";
import authMiddleware from "../../middleware/authMiddleware.js";
import * as eventController from "../event/event.controller.js";
import { profileUpload } from "../../middleware/upload.js";
import requireRealUserMiddleware from "../../middleware/requireRealUserMiddleware.js";

const profileRoutes = express.Router();

profileRoutes.get(
  "/profile",
  requireRealUserMiddleware,
  profileController.getProfile
);

profileRoutes.put(
  "/profile",
  requireRealUserMiddleware,
  profileUpload.single("picture"),
  validate(profileSchema),
  profileController.setProfile
);

profileRoutes.get(
  "/events",
  requireRealUserMiddleware,
  eventController.getUserRegistrationsController
);
export default profileRoutes;
