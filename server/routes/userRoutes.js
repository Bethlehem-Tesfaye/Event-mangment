import express from "express";
import { getProfile, setProfile } from "../controllers/userControllers.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { profileSchema } from "../schemas/userSchema.js";
import { getEvents } from "../controllers/eventController.js";
import { viewAttendeesForMyEvents, viewMyTickets } from "../controllers/attendeeController.js";

const userRouter = express.Router();

userRouter.get("/profile", authMiddleware, getProfile);
userRouter.put("/profile", authMiddleware, validate(profileSchema), setProfile);
//users-events by status
userRouter.get("/events", authMiddleware, getEvents);
// user-tickets
userRouter.get('/events/my', authMiddleware, viewMyTickets)
// user event attendees
userRouter.get("/events/attendees", authMiddleware, viewAttendeesForMyEvents)

export default userRouter;
