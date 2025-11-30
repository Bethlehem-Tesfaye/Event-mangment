import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  locationType: z.enum(["online", "in-person"]).optional(),
  location: z.string().optional(),
  startDatetime: z.coerce.date().optional(),
  endDatetime: z.coerce.date().optional(),
  duration: z.coerce.number().optional(),
  eventBannerUrl: z.string().url().optional()
});

export const updateEventSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  locationType: z.enum(["in-person", "online"]).optional(),
  location: z.string().optional(),
  startDatetime: z.preprocess(
    (val) => {
      if (typeof val === "string" && val.trim() !== "") {
        const d = new Date(val);
        if (!Number.isNaN(d.getTime())) return d.toISOString();
      }
      return val;
    },
    z.string().datetime({ message: "Invalid start date" }).optional()
  ),
  endDatetime: z.preprocess(
    (val) => {
      if (typeof val === "string" && val.trim() !== "") {
        const d = new Date(val);
        if (!Number.isNaN(d.getTime())) return d.toISOString();
      }
      return val;
    },
    z.string().datetime({ message: "Invalid end date" }).optional()
  ),
  duration: z.coerce.number().optional(),
  eventBannerUrl: z.string().url("Invalid URL").optional(),
  status: z.enum(["draft", "published", "cancelled"]).optional()
});

export const createCategorySchema = z.object({
  categoryId: z.number().int()
});
