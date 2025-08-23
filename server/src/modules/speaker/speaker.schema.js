import { z } from "zod";

export const createSpeakerSchema = z.object({
  name: z.string(),
  bio: z.string().optional(),
  photoUrl: z.string().url("Invalid photo URL").optional()
});
export const updateSpeakerSchema = z.object({
  name: z.string().optional(),
  bio: z.string().optional(),
  photoUrl: z.string().url("Invalid photo URL").optional()
});
