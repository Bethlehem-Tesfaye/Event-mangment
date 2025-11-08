import express from "express";
import profileRoutes from "./modules/profile/profile.routes.js";
import { eventRoutes, organizerRoutes } from "./modules/event/event.route.js";
import { userTicketRoutes } from "./modules/ticket/ticket.routes.js";

const router = express.Router();

router.use("/users", profileRoutes);
router.use("/events", eventRoutes);
router.use("/organizer/events", organizerRoutes);
router.use("/users/tickets", userTicketRoutes);

export default router;
