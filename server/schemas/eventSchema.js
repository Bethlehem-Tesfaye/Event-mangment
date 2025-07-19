import { z } from "zod";

export const eventSchema = z
  .object({
    title: z
      .string("Title is required")
      .trim()
      .min(1, { message: "Title cannot be empty" }),
    description: z
      .string("Description is required")
      .trim()
      .min(1, { message: "Description cannot be empty" }),
    locationType: z
      .string("Location type is required")
      .trim()
      .min(1, { message: "Location type cannot be empty" }),
    location: z
      .string("Location is required")
      .trim()
      .min(1, { message: "Location cannot be empty" }),
    date: z
      .string("Date is required")
      .trim()
      .min(1, { message: "Date cannot be empty" })
      .refine((val) => !Number.isNaN(Date.parse(val)), {
        message: "Invalid date format"
      })
      .refine((val) => new Date(val) >= new Date(), {
        message: "Date must be today or in the future"
      })
      .transform((val) => new Date(val)),
    startTime: z
      .string("Start time is required")
      .trim()
      .min(1, { message: "Start time cannot be empty" })
      .refine((val) => /^([01]\d|2[0-3]):[0-5]\d$/.test(val), {
        message: "Invalid start time format (HH:MM expected)"
      }),
    endTime: z
      .string("End time is required")
      .trim()
      .min(1, { message: "End time cannot be empty" })
      .refine((val) => /^([01]\d|2[0-3]):[0-5]\d$/.test(val), {
        message: "Invalid end time format (HH:MM expected)"
      })
  })
  .check((ctx) => {
    const start = Date.parse(`1970-01-01T${ctx.value.startTime}:00`);
    const end = Date.parse(`1970-01-01T${ctx.value.endTime}:00`);
    if (start >= end) {
      ctx.issues.push({
        code: "custom",
        message: "End time must be after start time",
        path: ["endTime"]
      });
    }
  });
export const updateSpeakersSchema = z.object({
  speakers: z
    .array(
      z.object({
        name: z
          .string("Speaker name is required")
          .trim()
          .min(1, { message: "Speaker name cannot be empty" }),
        bio: z
          .string("Speaker bio is required")
          .trim()
          .min(1, { message: "Speaker bio cannot be empty" })
      })
    )
    .min(1, { message: "At least one speaker is required" })
});

export const updateTicketsSchema = z.object({
  tickets: z
    .array(
      z.object({
        type: z
          .string("Ticket type is required")
          .trim()
          .min(1, { message: "Ticket type cannot be empty" }),
        price: z
          .number("Ticket price is required")
          .min(0, { message: "Price must be 0 or more" }),
        quantity: z
          .number("Ticket quantity is required")
          .int({ message: "Quantity must be an integer" })
          .min(1, { message: "Quantity must be at least 1" }),
        max_per_user: z
          .number()
          .int({ message: "Max per user must be an integer" })
          .min(1, { message: "Max per user must be at least 1" })
          .optional()
      })
    )
    .min(1, { message: "At least one ticket is required" })
});

export const updateCategoriesSchema = z.object({
  categories: z
    .array(
      z
        .number("Category ID must be a number")
        .int({ message: "Category ID must be an integer" })
        .min(1, { message: "Category ID must be positive" })
    )
    .min(1, { message: "At least one category is required" })
});
