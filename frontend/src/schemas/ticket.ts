import { z } from "zod";

export const createTicketSchema = z.object({
  type: z.string().min(1, "Ticket type is required"),
  price: z.coerce
    .number({ error: "Price must be a number" })
    .nonnegative({ message: "Price must be 0 or greater" }),
  totalQuantity: z.coerce
    .number({ error: "Total quantity must be a number" })
    .int({ message: "Total quantity must be an integer" })
    .positive({ message: "Total quantity must be greater than 0" }),
  maxPerUser: z.coerce
    .number({ error: "Max per user must be a number" })
    .int({ message: "Max per user must be an integer" })
    .positive({ message: "Max per user must be greater than 0" })
    .optional(),
});

export const updateTicketSchema = z.object({
  type: z.string().min(1, "Ticket type is required").optional(),
  price: z.coerce
    .number({ error: "Price must be a number" })
    .nonnegative({ message: "Price must be 0 or greater" })
    .optional(),
  totalQuantity: z.coerce
    .number({ error: "Total quantity must be a number" })
    .int({ message: "Total quantity must be an integer" })
    .positive({ message: "Total quantity must be greater than 0" })
    .optional(),
  maxPerUser: z.coerce
    .number({ error: "Max per user must be a number" })
    .int({ message: "Max per user must be an integer" })
    .positive({ message: "Max per user must be greater than 0" })
    .optional(),
});
