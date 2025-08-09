import { z } from "zod";

// For createEvent
export const createEventSchema = z.object({
  event: z.object({
    title: z.string(),
    description: z.string().optional(),
    locationType: z.enum(["online", "in-person"]).optional(),
    location: z.string().optional(),
    startDatetime: z.coerce.date().optional(),
    endDatetime: z.coerce.date().optional(),
    duration: z.number().optional(),
    eventBannerUrl: z.string().url().optional()
  }),
  categoryIds: z.array(z.number().int()).optional()
});

// For updateEvent
export const updateEventSchema = z.object({
  eventInfo: z.object({
    title: z.string(),
    description: z.string(),
    locationType: z.enum(["in-person", "online"]),
    location: z.string(),
    startDateTime: z.string().datetime({ message: "Invalid start date" }),
    endDateTime: z.string().datetime({ message: "Invalid end date" }),
    duration: z.number().int().positive(),
    eventBannerUrl: z.string().url("Invalid URL").optional()
  }),
  speakers: z.array(
    z.object({
      name: z.string(),
      bio: z.string().optional(),
      photoUrl: z.string().url("Invalid photo URL").optional()
    })
  ),
  tickets: z.array(
    z.object({
      id: z.number().int().optional(),
      type: z.string(),
      price: z.number().nonnegative(),
      totalQuantity: z.number().int().positive(),
      maxPerUser: z.number().int().positive().optional()
    })
  )
});

// For updateEventStatus
export const updateEventStatusSchema = z.object({
  status: z.enum(["draft", "published", "cancelled"])
});
