import express from "express";
import * as eventController from "./event.controller.js";
import * as ticketController from "../ticket/ticket.controller.js";
import * as speakeController from "../speaker/speaker.contollers.js";
import optionalAuthMiddleware from "../../middleware/optionalAuthMiddleware.js";
import authMiddleware from "../../middleware/authMiddleware.js";
import { validate } from "../../middleware/validate.js";
import {
  createCategorySchema,
  createEventSchema,
  updateEventSchema
} from "./event.schema.js";
import isEventOwner from "../../middleware/isEventOwner.js";
import { ticketRoutes } from "../ticket/ticket.routes.js";
import { speakerRoutes } from "../speaker/speaker.routes.js";

export const eventRoutes = express.Router();

eventRoutes.get("/", eventController.listEvents);
eventRoutes.get("/categories", eventController.getAllCategoriesController);

eventRoutes.get("/:eventId", eventController.getEventDetails);
eventRoutes.get(
  "/:eventId/speakers",
  speakeController.getPublicSpealersForEvent
);
eventRoutes.get("/:eventId/tickets", ticketController.getPublicTicketsForEvent);
eventRoutes.post(
  "/:eventId/tickets/purchase",
  optionalAuthMiddleware,
  eventController.purchaseTicket
);

export const organizerRoutes = express.Router({ mergeParams: true });

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

//
organizerRoutes.use("/:eventId", ticketRoutes);
organizerRoutes.use("/:eventId", speakerRoutes);
