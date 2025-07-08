import express from 'express'
import { cancelEvent, createEvent, deleteDraftEvent, getDraftEvents, getEventInfo, getPublishedEvents, updateEvent } from '../controllers/eventController.js'
import userMiddleware from '../middleware/userMiddleware.js'

const eventRouter = express.Router()

eventRouter.post('/create-event', userMiddleware, createEvent)
eventRouter.get('/get-draft-event', userMiddleware, getDraftEvents)
eventRouter.get('/get-published-event', userMiddleware, getPublishedEvents)
eventRouter.get('/get-event-info/:id', userMiddleware, getEventInfo)
eventRouter.put('/edit-event-info/:id', userMiddleware, updateEvent)
eventRouter.delete('/cancel-event/:id', userMiddleware, cancelEvent)
eventRouter.delete('/delete-event/:id', userMiddleware, deleteDraftEvent)


export default eventRouter