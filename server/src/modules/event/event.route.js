import express from "express";
import * as eventController from "./event.controller.js";
import optionalAuthMiddleware from "../../middleware/optionalAuthMiddleware.js";
import authMiddleware from "../../middleware/authMiddleware.js";
import { validate } from "../../middleware/validate.js";
import {
  createCategorySchema,
  createEventSchema,
  createSpeakerSchema,
  createTicketSchema,
  updateEventSchema,
  updateSpeakerSchema
} from "./event.schema.js";
import isEventOwner from "../../middleware/isEventOwner.js";

export const eventRoutes = express.Router();

eventRoutes.get("/", eventController.listEvents);
eventRoutes.get("/:eventId", eventController.getEventDetails);
eventRoutes.get("/:eventId/speakers", eventController.getEventSpeakers);
eventRoutes.get("/:eventId/tickets", eventController.getEventTickets);
eventRoutes.post(
  "/:eventId/tickets/purchase",
  optionalAuthMiddleware,
  eventController.purchaseTicket
);

// ORGANIZER ROUTES
export const organizerRoutes = express.Router();
organizerRoutes.use(authMiddleware);

organizerRoutes.post(
  "",
  validate(createEventSchema),
  eventController.createEvent
);
organizerRoutes.put(
  "/:eventId",
  validate(updateEventSchema),
  isEventOwner,
  eventController.updateEvent
);
organizerRoutes.delete("/:eventId", eventController.deleteEvent);
organizerRoutes.get("/:eventId", eventController.getEventDetailById);
organizerRoutes.get("/:eventId/speakers", eventController.getSpeakersForEvent);

organizerRoutes.post(
  "/:eventId/speakers",
  validate(createSpeakerSchema),
  isEventOwner,
  eventController.createSpeaker
);
organizerRoutes.put(
  "/:eventId/speakers/:speakerId",
  validate(updateSpeakerSchema),
  isEventOwner,
  eventController.updateSpeaker
);
organizerRoutes.delete(
  "/:eventId/speakers/:speakerId",
  isEventOwner,
  eventController.deleteSpeaker
);
organizerRoutes.post(
  "/:eventId/categories",
  validate(createCategorySchema),
  isEventOwner,
  eventController.addCategoryToEvent
);
organizerRoutes.delete(
  "/:eventId/categories/:categoryId",
  isEventOwner,
  eventController.removeCategoryFromEvent
);
organizerRoutes.get(
  "/:eventId/attendees",
  isEventOwner,
  eventController.getEventAttendees
);

organizerRoutes.get(
  "/:eventId/analytics",
  isEventOwner,
  eventController.getEventAnalytics
);
