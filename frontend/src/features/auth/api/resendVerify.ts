import { api } from "@/lib/axios";

export const resendVerificationEmail = async (email: string) => {
  const { data } = await api.post("/auth/verify-email/resend", { email });
  return data;
};
