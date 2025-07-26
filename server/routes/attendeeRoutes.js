import express from "express";
import {
  eventRegister
} from "../controllers/attendeeController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { eventRegisterSchema } from "../schemas/attendeeSchema.js";

const attendeeRouter = express.Router({ mergeParams: true });

attendeeRouter.post(
  "/register/:ticketId",
  authMiddleware,
  validate(eventRegisterSchema),
  eventRegister
);

export default attendeeRouter;
