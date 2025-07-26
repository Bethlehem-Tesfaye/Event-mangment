import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import {
  addSpeakers,
  getEventSpeakers,
  updateSpeakers
} from "../controllers/eventController.js";
import {
  speakersSchema,
  updateSpeakersSchema
} from "../schemas/eventSchema.js";
import isEventOwner from "../middleware/isEventOwner.js";

const speakerRouter = express.Router({ mergeParams: true });

speakerRouter.get("/", authMiddleware, getEventSpeakers);
speakerRouter.post(
  "/",
  authMiddleware,
  isEventOwner,
  validate(speakersSchema),
  addSpeakers
);
speakerRouter.patch(
  "/",
  authMiddleware,
  isEventOwner,
  validate(updateSpeakersSchema),
  updateSpeakers
);

export default speakerRouter;
