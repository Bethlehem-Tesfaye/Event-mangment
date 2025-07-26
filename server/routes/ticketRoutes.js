import express from 'express'
import authMiddleware from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { addTickets, getEventTickets, updateTickets } from '../controllers/eventController.js';
import { ticketsSchema, updateTicketsSchema } from '../schemas/eventSchema.js';


const ticketRouter = express.Router({ mergeParams: true });

ticketRouter.get("/", authMiddleware, getEventTickets)
ticketRouter.post("/",authMiddleware,validate(ticketsSchema), addTickets)
ticketRouter.patch("/", authMiddleware, validate(updateTicketsSchema, updateTickets))

export default ticketRouter