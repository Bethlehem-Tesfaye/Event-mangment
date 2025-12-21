import { Router } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";

const router = Router();

router.use("/", toNodeHandler(auth));

export default router;
