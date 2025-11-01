import { z } from "zod";

export const registerSchema = z
  .object({
    email: z.email(),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long" })
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.email(),
    password: z
      .string()
      .nonempty()
      .min(1, { message: "Password can't be empty" })
  })
  .strict();

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .nonempty({ message: "Current password is required" })
      .min(6, {
        message: "Current password must be at least 6 characters long"
      }),
    newPassword: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long" })
  })
  .strict();

export const setPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long" })
  })
  .strict();
