import express from "express";
import * as ticketController from "./ticket.controller.js";
import authMiddleware from "../../middleware/authMiddleware.js";
import { validate } from "../../middleware/validate.js";
import isEventOwner from "../../middleware/isEventOwner.js";
import { createTicketSchema, UpdateTicketSchema } from "./ticket.schema.js";

export const ticketRoutes = express.Router({ mergeParams: true });
ticketRoutes.use(authMiddleware);
ticketRoutes.use(isEventOwner);
ticketRoutes.get("/tickets", ticketController.getTicketsForEvent);
ticketRoutes.post(
  "/tickets",
  validate(createTicketSchema),
  ticketController.createTicket
);
ticketRoutes.put(
  "/tickets/:ticketId",
  validate(UpdateTicketSchema),
  ticketController.updateTicket
);
ticketRoutes.delete("/tickets/:ticketId", ticketController.deleteTicket);
// user tickets
export const userTicketRoutes = express.Router();
userTicketRoutes.use(authMiddleware);
userTicketRoutes.get(
  "/tickets",
  authMiddleware,
  ticketController.getUserTicketHistory
);
