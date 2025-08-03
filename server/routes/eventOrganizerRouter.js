import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import isEventOwner from "../middleware/isEventOwner.js";
import {
  createEvent,
  deleteDraftEvent,
  getAllCategories,
  getEventDetails,
  updateEvent,
  updateEventStatus
} from "../controllers/eventOrganizerController.js";
import { validate } from "../middleware/validate.js";
import {
  createEventSchema,
  updateEventSchema,
  updateEventStatusSchema
} from "../schemas/eventSchema.js";

const eventOrgainizerRouter = express.Router();

eventOrgainizerRouter.post(
  "/",
  authMiddleware,
  validate(createEventSchema),
  createEvent
);
eventOrgainizerRouter.get("/categories", authMiddleware, getAllCategories);

eventOrgainizerRouter.get(
  "/:id",
  authMiddleware,
  isEventOwner,
  getEventDetails
);
eventOrgainizerRouter.put(
  "/:id",
  authMiddleware,
  isEventOwner,
  validate(updateEventSchema),
  updateEvent
);

eventOrgainizerRouter.patch(
  "/:id/status",
  authMiddleware,
  isEventOwner,
  validate(updateEventStatusSchema),
  updateEventStatus
);
eventOrgainizerRouter.delete(
  "/:id",
  authMiddleware,
  isEventOwner,
  deleteDraftEvent
);

export default eventOrgainizerRouter;
