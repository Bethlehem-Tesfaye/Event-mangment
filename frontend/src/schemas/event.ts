import { z } from "zod";

// Backend compatible (create)
export const createEventSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  locationType: z.enum(["online", "in-person"]).optional(),
  location: z.string().optional(),
  startDatetime: z.coerce.date().optional(),
  endDatetime: z.coerce.date().optional(),
  duration: z.coerce.number().optional(),
  eventBannerUrl: z.string().url().optional(),
});

// Backend compatible (update)
export const updateEventSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  locationType: z.enum(["in-person", "online"]).optional(),
  location: z.string().optional(),

  startDatetime: z.preprocess((val) => {
    if (typeof val === "string" && val.trim() !== "") {
      const d = new Date(val);
      if (!isNaN(d.getTime())) return d.toISOString();
    }
    return val;
  }, z.string().datetime({ message: "Invalid start date" }).optional()),

  endDatetime: z.preprocess((val) => {
    if (typeof val === "string" && val.trim() !== "") {
      const d = new Date(val);
      if (!isNaN(d.getTime())) return d.toISOString();
    }
    return val;
  }, z.string().datetime({ message: "Invalid end date" }).optional()),

  duration: z.coerce.number().optional(),
  eventBannerUrl: z.string().url("Invalid URL").optional(),
  status: z.enum(["draft", "published", "cancelled"]).optional(),
});

// FRONTEND-FRIENDLY (React Hook Form) with custom messages
export const eventFormSchema = z
  .object({
    title: z.string().min(1, "Title is required"),

    description: z.string().optional(),

    // require a non-empty selection and validate allowed values
    locationType: z
      .string()
      .min(1, "Select location type")
      .refine((v) => v === "online" || v === "in-person", {
        message: "Location must be 'online' or 'in-person'",
      }),

    location: z.string().optional(),

    // inputs are strings from <input>; validate parsable date and show message
    startDatetime: z
      .string()
      .min(1, "Start date/time is required")
      .refine((s) => !Number.isNaN(new Date(s).getTime()), {
        message: "Invalid start date",
      }),

    endDatetime: z
      .string()
      .optional()
      .refine(
        (s) =>
          s === "" || s === undefined || !Number.isNaN(new Date(s).getTime()),
        { message: "Invalid end date" }
      ),

    // duration kept as string in form; ensure numeric when provided
    duration: z
      .string()
      .optional()
      .refine((v) => v === "" || v === undefined || !Number.isNaN(Number(v)), {
        message: "Duration must be a number",
      }),

    eventBannerPreview: z.string().optional(),
    eventBannerUrl: z.string().url("Invalid URL").optional(),
    eventBannerFile: z.any().optional(),
  })
  .superRefine((vals, ctx) => {
    // cross-field: end must be after start (if both provided)
    const s = vals.startDatetime ? new Date(vals.startDatetime).getTime() : NaN;
    const e = vals.endDatetime ? new Date(vals.endDatetime).getTime() : NaN;
    if (!Number.isNaN(s) && !Number.isNaN(e)) {
      if (e <= s) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["endDatetime"],
          message: "End must be after start",
        });
      }
    }
  });
