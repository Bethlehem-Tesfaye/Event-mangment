import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import {
  addCategories,
  getEventCategories,
  updateCategories
} from "../controllers/eventController.js";
import {
  categoriesSchema,
  updateCategoriesSchema
} from "../schemas/eventSchema.js";

const categoryRouter = express.Router({ mergeParams: true });

categoryRouter.get("/", authMiddleware, getEventCategories);
categoryRouter.post(
  "/",
  authMiddleware,
  validate(categoriesSchema),
  addCategories
);
categoryRouter.patch(
  "/",
  authMiddleware,
  validate(updateCategoriesSchema),
  updateCategories
);

export default categoryRouter;
