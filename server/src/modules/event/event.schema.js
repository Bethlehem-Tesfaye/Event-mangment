// For createEvent
import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  locationType: z.enum(["online", "inPerson"]).optional(),
  location: z.string().optional(),
  startDatetime: z.coerce.date().optional(),
  endDatetime: z.coerce.date().optional(),
  duration: z.number().optional(),
  eventBannerUrl: z.string().url().optional()
});

export const updateEventSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  locationType: z.enum(["in-person", "online"]).optional(),
  location: z.string().optional(),
  startDatetime: z
    .string()
    .datetime({ message: "Invalid start date" })
    .optional(),
  endDatetime: z.string().datetime({ message: "Invalid end date" }).optional(),
  duration: z.number().int().positive().optional(),
  eventBannerUrl: z.string().url("Invalid URL").optional(),
  status: z.enum(["draft", "published", "canceled"]).optional()
});
export const createTicketSchema = z.object({
  type: z.string(),
  price: z.number().nonnegative(),
  totalQuantity: z.number().int().positive(),
  maxPerUser: z.number().int().positive().optional()
});

export const UpdateTicketSchema = z.object({
  type: z.string().optional(),
  price: z.number().nonnegative().optional(),
  totalQuantity: z.number().int().positive().optional(),
  maxPerUser: z.number().int().positive().optional()
});

export const createSpeakerSchema = z.object({
  name: z.string(),
  bio: z.string().optional(),
  photoUrl: z.string().url("Invalid photo URL").optional()
});
export const updateSpeakerSchema = z.object({
  name: z.string().optional(),
  bio: z.string().optional(),
  photoUrl: z.string().url("Invalid photo URL").optional()
});

export const createCategorySchema = z.object({
  categoryId: z.number().int()
});
