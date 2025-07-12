import express from 'express'
import { eventRegister, viewAttendeesForMyEvents, viewMyTickets } from '../controllers/attendeeController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const attendeeRouter = express.Router({ mergeParams: true }) 

attendeeRouter.post('/register/:ticketId', authMiddleware, eventRegister)
attendeeRouter.get('/my-tickets',authMiddleware, viewMyTickets)
attendeeRouter.get('/my-event-attendees',authMiddleware, viewAttendeesForMyEvents)

export default attendeeRouter