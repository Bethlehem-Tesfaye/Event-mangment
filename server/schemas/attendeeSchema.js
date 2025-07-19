import { z } from "zod";

export const eventRegisterSchema = z.object({
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .min(1, "Quantity must be greater than 0")
});
