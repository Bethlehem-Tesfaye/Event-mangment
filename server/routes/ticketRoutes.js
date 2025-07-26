import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import {
  addTickets,
  getEventTickets,
  updateTickets
} from "../controllers/eventController.js";
import { ticketsSchema, updateTicketsSchema } from "../schemas/eventSchema.js";
import isEventOwner from "../middleware/isEventOwner.js";

const ticketRouter = express.Router({ mergeParams: true });

ticketRouter.get("/", authMiddleware, getEventTickets);
ticketRouter.post(
  "/",
  authMiddleware,
  isEventOwner,
  validate(ticketsSchema),
  addTickets
);
ticketRouter.patch(
  "/",
  authMiddleware,
  isEventOwner,
  validate(updateTicketsSchema, updateTickets)
);

export default ticketRouter;
