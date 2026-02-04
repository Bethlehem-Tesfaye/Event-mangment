import express from "express";

import * as notificationController from "./notification.controller.js";
import authMiddleware from "../../middleware/authMiddleware.js";
import optionalAuthMiddleware from "../../middleware/optionalAuthMiddleware.js";

export const notificationRoutes = express.Router();

notificationRoutes.get(
  "/",
  optionalAuthMiddleware,
  notificationController.getNotification
);

notificationRoutes.put(
  "/:id/read",
  optionalAuthMiddleware,
  notificationController.markAsRead
);

notificationRoutes.put(
  "/read-all",
  optionalAuthMiddleware,
  notificationController.markAllAsRead
);
