import { z } from "zod";

export const createTicketSchema = z.object({
  type: z.string(),
  price: z.coerce.number().nonnegative(),
  totalQuantity: z.coerce.number().int().positive(),
  maxPerUser: z.coerce.number().int().positive().optional()
});

export const UpdateTicketSchema = z.object({
  type: z.string().optional(),
  price: z.coerce.number().nonnegative().optional(),
  totalQuantity: z.coerce.number().int().positive().optional(),
  maxPerUser: z.coerce.number().int().positive().optional()
});
