import { z } from "zod";

// create (frontend-friendly) speaker schema with friendly messages
export const createSpeakerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  bio: z.string().optional(),
  photoUrl: z.string().url("Invalid photo URL").optional(),
});

// update schema (fields optional) — keeps friendly messages
export const updateSpeakerSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  bio: z.string().optional(),
  photoUrl: z.string().url("Invalid photo URL").optional(),
});
