import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import {
  createEvent,
  deleteDraftEvent,
  getAllCategories,
  getAllEvents,
  getAllEventsByCategory,
  getEventInfo,
  getEventPreview,
  updateEventInfo,
  updateEventStatus
} from "../controllers/eventController.js";
import { validate } from "../middleware/validate.js";
import { eventSchema } from "../schemas/eventSchema.js";
import attendeeRouter from "./attendeeRoutes.js";
import speakerRouter from "./speakerRoutes.js";
import ticketRouter from "./ticketRoutes.js";
import categoryRouter from "./categoryRoutes.js";

const eventRouter = express.Router();

eventRouter.get("/", getAllEvents);
eventRouter.get("/category/:id", getAllEventsByCategory);
eventRouter.get("/:id/preview", getEventPreview);

eventRouter.get("/categories", authMiddleware, getAllCategories);

eventRouter.post("/", authMiddleware, validate(eventSchema), createEvent);
eventRouter.put("/:id", authMiddleware, validate(eventSchema), updateEventInfo);
eventRouter.get("/:id", authMiddleware, getEventInfo);

// publishing and canceling
eventRouter.put("/:id/status", authMiddleware, updateEventStatus);

// Deletion
eventRouter.delete("/:id", authMiddleware, deleteDraftEvent);

// nested router
eventRouter.use("/:id/attendees", attendeeRouter);
eventRouter.use("/:id/speakers", speakerRouter);
eventRouter.use("/:id/tickets", ticketRouter);
eventRouter.use("/:id/categories", categoryRouter);

export default eventRouter;
