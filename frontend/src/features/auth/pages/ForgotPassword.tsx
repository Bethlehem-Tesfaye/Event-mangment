import React, { useState } from "react";
import { useForgotPassword } from "../hooks/useForgotPassword";
import { AuthLayout } from "../components/AuthLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import PageContainer from "@/components/PageContainer";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const forgotPassword = useForgotPassword();

  const submitting =
    (forgotPassword as any).isPending || forgotPassword.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email.");
      return;
    }

    forgotPassword.mutate(
      {
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      },
      {
        onSuccess: () => {
          toast.success("Password reset email sent! Check your inbox.");
        },
        onError: (err: any) => {
          const msg =
            err?.response?.data?.error ||
            err?.message ||
            "Failed to send reset email.";
          toast.error(msg);
        },
      }
    );
  };

  return (
    <PageContainer>
      <AuthLayout title="Forgot Password">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 h-full justify-center"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10"
            />
          </div>

          <div>
            <Button type="submit" className="w-full h-10" disabled={submitting}>
              {submitting ? "Sending..." : "Send Reset Link"}
            </Button>
          </div>
        </form>
      </AuthLayout>
    </PageContainer>
  );
}
