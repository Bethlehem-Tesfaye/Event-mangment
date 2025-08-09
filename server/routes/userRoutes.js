import express from "express";
import { getProfile, setProfile } from "../controllers/userControllers.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { profileSchema } from "../schemas/userSchema.js";
import {
  getEventAttendees,
  viewMyTickets
} from "../controllers/attendeeController.js";
import isEventOwner from "../middleware/isEventOwner.js";

const userRouter = express.Router();

userRouter.get("/profile", authMiddleware, getProfile);
userRouter.put("/profile", authMiddleware, validate(profileSchema), setProfile);
userRouter.get("/events/my", authMiddleware, viewMyTickets);
userRouter.get(
  "/events/:id/attendees",
  authMiddleware,
  isEventOwner,
  getEventAttendees
);

export default userRouter;
