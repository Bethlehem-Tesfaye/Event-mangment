import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CardDescription } from "@/components/ui/card";
import { SocialButtons } from "./SocialButtons";

export interface RegisterFormProps {
  onSubmit: (values: { email: string; password: string }) => void;
  onSocialClick: (provider: string) => void;
  onLogin: () => void;
  isLoading?: boolean;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSubmit,
  onSocialClick,
  onLogin,
  isLoading = false,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({ email, password });
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      className="flex flex-col gap-4 h-full justify-between"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          className="h-10"
          id="email"
          type="email"
          placeholder="you@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="password">Password</Label>
        <Input
          className="h-10"
          id="password"
          type="password"
          placeholder="********"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="text-center">
        <CardDescription
          className="hover:text-blue-900 hover:cursor-pointer"
          onClick={onLogin}
        >
          Already have an account? Login
        </CardDescription>
      </div>

      <div className="flex flex-col gap-4 w-full">
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Registering..." : "Register"}
        </Button>

        <div className="flex items-center gap-2 w-full">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="text-sm text-gray-500">or sign up with</span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        <CardDescription className="text-center text-sm">
          By clicking Continue on Google or Facebook, you agree to EventLight's Terms of Service and Privacy Policy.
        </CardDescription>

        <SocialButtons onClick={onSocialClick} />
      </div>
    </form>
  );
};
