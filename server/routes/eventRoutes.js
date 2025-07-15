import express from 'express'

import authMiddleware from '../middleware/authMiddleware.js'
import { cancelEvent, createEvent, deleteDraftEvent, getAllCategories, getAllEvents, getAllEventsByCategory, getEvent, getEventCategories, getEventPreview, getEvents, getEventSpeakers, getEventTickets, publishEvent, updateCategories, updateEventInfo, updateSpeakers, updateTickets } from '../controllers/eventController.js'
import attendeeRouter from './attendeeRoutes.js';


const eventRouter = express.Router()

eventRouter.post('/', authMiddleware, createEvent)
eventRouter.put('/:id', authMiddleware, updateEventInfo)
eventRouter.put('/:id/speakers', authMiddleware, updateSpeakers)
eventRouter.put('/:id/tickets', authMiddleware, updateTickets)
eventRouter.put('/:id/categories', authMiddleware, updateCategories)
eventRouter.put('/:id/publish', authMiddleware, publishEvent)

eventRouter.get('/:id', authMiddleware, getEvent)
eventRouter.get('/:id/speakers', authMiddleware, getEventSpeakers)
eventRouter.get('/:id/tickets', authMiddleware, getEventTickets)
eventRouter.get('/:id/categories', authMiddleware, getEventCategories)
eventRouter.get('/categories', authMiddleware, getAllCategories)

eventRouter.get('/', authMiddleware, getEvents)

eventRouter.put('/:id/cancel', authMiddleware, cancelEvent)
eventRouter.delete('/:id', authMiddleware, deleteDraftEvent)

eventRouter.get('/public', getAllEvents);                   
eventRouter.get('/public/category/:id', getAllEventsByCategory);            
eventRouter.get('/public/:id', getEventPreview);  

eventRouter.use('/:id/attendees', attendeeRouter)


export default eventRouter