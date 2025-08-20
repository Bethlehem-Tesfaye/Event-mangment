import express from "express";
import * as ticketController from './ticket.controller.js'
import authMiddleware from "../../middleware/authMiddleware";
import { validate } from "../../middleware/validate.js";
import isEventOwner from "../../middleware/isEventOwner";
import { createTicketSchema, UpdateTicketSchema } from "./ticket.schema";


export const ticketRoutes = express.Router()
ticketRoutes.use(authMiddleware)
ticketRoutes.use(isEventOwner)

ticketRoutes.get(/:eventId/tickets, ticketController.getTicketsForEvent)
ticketRoutes.post('/:eventId/tickets', validate(createTicketSchema), ticketController.createTicket)
ticketRoutes.put('/:eventId/tickets/:ticketId', validate(UpdateTicketSchema), ticketController.updateTicket)
ticketRoutes.delete('/:eventId/tickets/:ticketId', ticketController.deleteTicket)

