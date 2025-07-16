import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import {
  cancelEvent,
  createEvent,
  deleteDraftEvent,
  getAllCategories,
  getAllEvents,
  getAllEventsByCategory,
  getEvent,
  getEventCategories,
  getEventPreview,
  getEvents,
  getEventSpeakers,
  getEventTickets,
  publishEvent,
  updateCategories,
  updateEventInfo,
  updateSpeakers,
  updateTickets
} from "../controllers/eventController.js";
import attendeeRouter from "./attendeeRoutes.js";
import { validate } from "../middleware/validate.js";
import {
  eventSchema,
  updateCategoriesSchema,
  updateSpeakersSchema,
  updateTicketsSchema
} from "../schemas/eventSchema.js";

const eventRouter = express.Router();

eventRouter.get("/public", getAllEvents);
eventRouter.get("/public/category/:id", getAllEventsByCategory);
eventRouter.get("/public/:id", getEventPreview);

eventRouter.post("/", authMiddleware, validate(eventSchema), createEvent);
eventRouter.put("/:id", authMiddleware, validate(eventSchema), updateEventInfo);
eventRouter.put(
  "/:id/speakers",
  authMiddleware,
  validate(updateSpeakersSchema),
  updateSpeakers
);
eventRouter.put(
  "/:id/tickets",
  authMiddleware,
  validate(updateTicketsSchema),
  updateTickets
);
eventRouter.put(
  "/:id/categories",
  authMiddleware,
  validate(updateCategoriesSchema),
  updateCategories
);
eventRouter.put("/:id/publish", authMiddleware, publishEvent);

eventRouter.get("/:id", authMiddleware, getEvent);
eventRouter.get("/:id/speakers", authMiddleware, getEventSpeakers);
eventRouter.get("/:id/tickets", authMiddleware, getEventTickets);
eventRouter.get("/:id/categories", authMiddleware, getEventCategories);
eventRouter.get("/categories", authMiddleware, getAllCategories);

eventRouter.get("/", authMiddleware, getEvents);

eventRouter.put("/:id/cancel", authMiddleware, cancelEvent);
eventRouter.delete("/:id", authMiddleware, deleteDraftEvent);

eventRouter.use("/:id/attendees", attendeeRouter);

export default eventRouter;
