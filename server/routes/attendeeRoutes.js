import express from 'express'
import { eventRegister, getAllEvents, getAllEventsByCategory, getEventPreview, viewAttendeesForMyEvents, viewMyTickets } from '../controllers/attendeeController.js'
import userMiddleware from '../middleware/userMiddleware.js'

const attendeeRouter = express.Router()

attendeeRouter.get('/public-events', getAllEvents)
attendeeRouter.get('/public-events/category/:id', getAllEventsByCategory)
attendeeRouter.get('/event-preview/:id', getEventPreview)
attendeeRouter.post('/event-register/:ticketId', userMiddleware, eventRegister)
attendeeRouter.get('/view-tickets',userMiddleware, viewMyTickets)
attendeeRouter.get('/view-registers',userMiddleware, viewAttendeesForMyEvents)

export default attendeeRouter