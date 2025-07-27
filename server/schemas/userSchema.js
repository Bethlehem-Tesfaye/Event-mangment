import { z } from "zod";

export const profileSchema = z.object({
  firstName: z
    .string()
    .nonempty({ message: "First name is required" })
    .trim()
    .max(50, { message: "First name too long" }),

  lastName: z
    .string()
    .nonempty({ message: "Last name is required" })
    .trim()
    .max(50, { message: "Last name too long" }),

  phone: z
    .string()
    .trim()
    .regex(/^\+?\d{9,15}$/, { message: "Invalid phone number" })
    .optional(),

  address: z
    .string()
    .trim()
    .max(100, { message: "Address too long" })
    .optional(),

  country: z
    .string()
    .trim()
    .max(56, { message: "Country name too long" })
    .optional(),

  city: z.string().trim().max(50, { message: "City name too long" }).optional()
});
