import express from 'express'

import userMiddleware from '../middleware/userMiddleware.js'
import { cancelEvent, createEvent, deleteDraftEvent, getAllCategories, getDraftEvents, getEvent, getEventCategories, getEventSpeakers, getEventTickets, getPublishedEvents, publishEvent, updateCategories, updateEventInfo, updateSpeakers, updateTickets } from '../controllers/eventController.js'

const eventRouter = express.Router()

eventRouter.post('/create-event', userMiddleware, createEvent)
eventRouter.put('/edit-event/:id', userMiddleware, updateEventInfo)
eventRouter.put('/edit-speakers/:id', userMiddleware, updateSpeakers)
eventRouter.put('/edit-tickets/:id', userMiddleware, updateTickets)
eventRouter.put('/edit-categories/:id', userMiddleware, updateCategories)
eventRouter.put('/publish-event/:id', userMiddleware, publishEvent)
eventRouter.get('/get-event/:id', userMiddleware, getEvent)
eventRouter.get('/get-speakers/:id', userMiddleware, getEventSpeakers)
eventRouter.get('/get-tickets/:id', userMiddleware, getEventTickets)
eventRouter.get('/get-categories/:id', userMiddleware, getEventCategories)
eventRouter.get('/get-all-categories', userMiddleware, getAllCategories)
eventRouter.get('/get-draft-event', userMiddleware, getDraftEvents)
eventRouter.get('/get-published-event', userMiddleware, getPublishedEvents)
eventRouter.put('/cancel-event/:id', userMiddleware, cancelEvent)
eventRouter.delete('/delete-event/:id', userMiddleware, deleteDraftEvent)


export default eventRouter