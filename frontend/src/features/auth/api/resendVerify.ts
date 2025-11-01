import { api } from "@/lib/axios";

export const resendVerificationEmail = async (email: string) => {
  const { data } = await api.post("/auth/verify-email/resend", { email });
  return data;
};
export const verifyEmail = async (token?: string | null) => {
  const { data } = await api.get(
    `/auth/verify-email?token=${encodeURIComponent(token ?? "")}`
  );
  return data;
};
