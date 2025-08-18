import express from "express";
import userRoutes from "./modules/user/user.routes.js";
import profileRoutes from "./modules/profile/profile.routes.js";
import { eventRoutes, organizerRoutes } from "./modules/event/event.route.js";

const router = express.Router();

router.use("/auth", userRoutes);
router.use("/users", profileRoutes);
router.use("/events", eventRoutes);
router.use("/organizer/events", organizerRoutes);

export default router;
