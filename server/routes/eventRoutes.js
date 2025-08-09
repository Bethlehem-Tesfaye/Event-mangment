import express from "express";
import attendeeRouter from "./attendeeRoutes.js";
import eventBrowserRouter from "./eventBrowserRouter.js";

const eventRouter = express.Router();

eventRouter.use("/:id/attendees", attendeeRouter);
eventRouter.use("/browse", eventBrowserRouter);

export default eventRouter;
