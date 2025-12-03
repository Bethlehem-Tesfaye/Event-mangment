import express from "express";

import * as notificationController from "./notification.controller.js";
import authMiddleware from "../../middleware/authMiddleware.js";

export const notificationRoutes = express.Router();

notificationRoutes.get(
  "/",
  authMiddleware,
  notificationController.getNotification
);

notificationRoutes.put(
  "/:id/read",
  authMiddleware,
  notificationController.markAsRead
);

notificationRoutes.put(
  "/read-all",
  authMiddleware,
  notificationController.markAllAsRead
);
