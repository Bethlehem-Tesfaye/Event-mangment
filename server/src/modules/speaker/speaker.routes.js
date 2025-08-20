import express from 'express'
import authMiddleware from '../../middleware/authMiddleware.js'
import isEventOwner from '../../middleware/isEventOwner.js'
import { validate } from '../../middleware/validate.js'
import * as speakerController from './speaker.contollers.js'
import { createSpeakerSchema, updateSpeakerSchema } from './speaker.schema.js'

export const speakerRoutes = express.Router()

speakerRoutes.use(authMiddleware)
speakerRoutes.use()

speakerRoutes.get('/:eventId/speakers', speakerController.getSpeakersForEvent )
speakerRoutes.post('/:eventId/speakers', validate(createSpeakerSchema), speakerController.createSpeaker)
speakerRoutes.put('/:eventId/speakers/:speakerId', validate(updateSpeakerSchema), speakerController.updateSpeaker)
speakerRoutes.delete('/:eventId/speakers/:speakerId', speakerController.deleteSpeaker)
