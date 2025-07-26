import express from 'express'
import authMiddleware from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { addSpeakers, getEventSpeakers, updateSpeakers } from '../controllers/eventController.js';
import { speakersSchema, updateSpeakersSchema } from '../schemas/eventSchema.js';


const speakerRouter = express.Router({ mergeParams: true });

speakerRouter.get("/", authMiddleware, getEventSpeakers);
speakerRouter.post("/", authMiddleware,validate(speakersSchema), addSpeakers)
speakerRouter.patch("/", authMiddleware, validate(updateSpeakersSchema), updateSpeakers)


export default speakerRouter