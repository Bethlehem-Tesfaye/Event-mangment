import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import {
  cancelEvent,
  createEvent,
  deleteDraftEvent,
  getAllCategories,
  getAllEvents,
  getAllEventsByCategory,
  getEventInfo,
  getEventCategories,
  getEventPreview,
  getEvents,
  getEventSpeakers,
  getEventTickets,
  publishEvent,
  updateCategories,
  updateEventInfo,
  updateSpeakers,
  updateTickets,
  addTickets,
  addSpeakers,
  addCategories
} from "../controllers/eventController.js";
import attendeeRouter from "./attendeeRoutes.js";
import { validate } from "../middleware/validate.js";
import {
  categoriesSchema,
  eventSchema,
  speakersSchema,
  ticketsSchema,
  updateCategoriesSchema,
  updateSpeakersSchema,
  updateTicketsSchema
} from "../schemas/eventSchema.js";

const eventRouter = express.Router();

eventRouter.get("/public", getAllEvents);
eventRouter.get("/public/category/:id", getAllEventsByCategory);
eventRouter.get("/public/:id", getEventPreview);

eventRouter.get("/categories", authMiddleware, getAllCategories);

eventRouter.get("/:id/categories", authMiddleware, getEventCategories);
eventRouter.get("/:id/speakers", authMiddleware, getEventSpeakers);
eventRouter.get("/:id/tickets", authMiddleware, getEventTickets);

eventRouter.post("/", authMiddleware, validate(eventSchema), createEvent);
eventRouter.put("/:id", authMiddleware, validate(eventSchema), updateEventInfo);
eventRouter.get("/:id", authMiddleware, getEventInfo);

eventRouter.post(
  "/:id/speakers",
  authMiddleware,
  validate(speakersSchema),
  addSpeakers
);
eventRouter.put(
  "/:id/speakers",
  authMiddleware,
  validate(updateSpeakersSchema),
  updateSpeakers
);

eventRouter.post(
  "/:id/tickets",
  authMiddleware,
  validate(ticketsSchema),
  addTickets
);
eventRouter.put(
  "/:id/tickets",
  authMiddleware,
  validate(updateTicketsSchema),
  updateTickets
);

eventRouter.post(
  "/:id/categories",
  authMiddleware,
  validate(categoriesSchema),
  addCategories
);
eventRouter.put(
  "/:id/categories",
  authMiddleware,
  validate(updateCategoriesSchema),
  updateCategories
);

// publishing and canceling
eventRouter.put("/:id/publish", authMiddleware, publishEvent);
eventRouter.put("/:id/cancel", authMiddleware, cancelEvent);

// organizers-events by status
eventRouter.get("/", authMiddleware, getEvents);

// Deletion
eventRouter.delete("/:id", authMiddleware, deleteDraftEvent);

// Attendee nested router
eventRouter.use("/:id/attendees", attendeeRouter);

export default eventRouter;
