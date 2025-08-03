import express from "express";

import {
  getAllEvents,
  getEventPreview
} from "../controllers/eventBrowserController.js";

const eventBrowserRouter = express.Router();

eventBrowserRouter.get("/", getAllEvents);
eventBrowserRouter.get("/:id/preview", getEventPreview);

export default eventBrowserRouter;
