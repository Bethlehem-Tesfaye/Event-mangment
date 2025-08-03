import { z } from "zod";

// For eventRegister
export const eventRegisterSchema = z.object({
  registeredQuantity: z.number().int().positive()
});
