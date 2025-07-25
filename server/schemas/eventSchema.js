import { z } from "zod";

// create and update event
export const eventSchema = z.object({
  title: z.string(),
  description: z.string(),
  locationType: z.enum(["in-person", "online"]),
  location: z.string(),
  startDateTime: z.string().datetime({ message: "Invalid start date" }),
  endDateTime: z.string().datetime({ message: "Invalid end date" }),
  duration: z.number().int().positive(),
  eventBannerUrl: z.string().url("Invalid URL").optional()
});

// createspeaker
export const speakersSchema = z.object({
  speakers: z
    .array(
      z.object({
        name: z.string(),
        bio: z.string().optional(),
        photo_url: z.string().url("Invalid photo URL").optional()
      })
    )
    .nonempty()
});
// update speaker
const newSpeakerSchema = z.object({
  name: z.string(),
  bio: z.string().optional(),
  photo_url: z.string().url("Invalid photo URL").optional()
});
export const updateSpeakersSchema = z.object({
  newSpeakers: z.array(newSpeakerSchema).optional(),
  updatedSpeakers: z
    .array(
      newSpeakerSchema.extend({
        id: z.number().int().positive({ message: "Speaker ID is required" })
      })
    )
    .optional(),
  deletedSpeakersIds: z.array(z.number().int().positive()).optional()
});

// tickets
export const ticketsSchema = z.object({
  tickets: z
    .array(
      z.object({
        type: z.string(),
        price: z
          .number({ required_error: "Ticket price is required" })
          .nonnegative({ message: "Price must be 0 or more" }),
        total_quantity: z
          .number({ required_error: "Quantity is required" })
          .int({ message: "Quantity must be an integer" }),
        max_per_user: z.number().int().optional()
      })
    )
    .nonempty()
});

// update ticketss
const newTicketSchema = z.object({
  type: z.string(),
  price: z
    .number({ required_error: "Price is required" })
    .nonnegative({ message: "Price must be 0 or more" }),
  total_quantity: z
    .number({ required_error: "Quantity is required" })
    .int({ message: "Quantity must be an integer" }),
  max_per_user: z.number().int().min(1).optional()
});
export const updateTicketsSchema = z.object({
  newTickets: z.array(newTicketSchema).optional(),
  updatedTickets: z
    .array(
      newTicketSchema.extend({
        id: z.number().int().positive()
      })
    )
    .optional(),
  deletedTicketIds: z.array(z.number().int().positive()).optional()
});

// categories
export const categoriesSchema = z.object({
  categories: z
    .array(
      z
        .number("Category ID must be a number")
        .int({ message: "Category ID must be an integer" })
    )
    .nonempty()
});
export const updateCategoriesSchema = z.object({
  newCategories: z
    .array(
      z.object({
        id: z.number()
      })
    )
    .optional(),

  deletedCategoriesIds: z.array(z.number()).optional()
});
