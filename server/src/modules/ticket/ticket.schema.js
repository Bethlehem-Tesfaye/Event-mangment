import { z } from "zod";

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
