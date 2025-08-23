import express from "express";
import authMiddleware from "../../middleware/authMiddleware.js";
import isEventOwner from "../../middleware/isEventOwner.js";
import { validate } from "../../middleware/validate.js";
import * as speakerController from "./speaker.contollers.js";
import { createSpeakerSchema, updateSpeakerSchema } from "./speaker.schema.js";

export const speakerRoutes = express.Router({ mergeParams: true });

speakerRoutes.use(authMiddleware);
speakerRoutes.use(isEventOwner);

speakerRoutes.get("/speakers", speakerController.getSpeakersForEvent);
speakerRoutes.post(
  "/speakers",
  validate(createSpeakerSchema),
  speakerController.createSpeaker
);
speakerRoutes.put(
  "/speakers/:speakerId",
  validate(updateSpeakerSchema),
  speakerController.updateSpeaker
);
speakerRoutes.delete("/speakers/:speakerId", speakerController.deleteSpeaker);
