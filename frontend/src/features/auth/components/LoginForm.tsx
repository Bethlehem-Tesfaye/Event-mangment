import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CardDescription, CardFooter } from "@/components/ui/card";
import { SocialButtons } from "./SocialButtons";
import type { LoginFormProps } from "../types/auth";

export const LoginForm = ({ onSubmit, onSocialClick, onRegister }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({ email, password });
  };

  return (
    <form onSubmit={handleFormSubmit} className="flex flex-col gap-3 h-full justify-between">
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
        <div className="flex justify-end text-sm mt-1">
          <CardDescription className="hover:text-blue-900 hover:cursor-pointer">
            Forgot password?
          </CardDescription>
        </div>
      </div>

      <div className="text-center">
        <CardDescription
          className="hover:text-blue-900 hover:cursor-pointer"
          onClick={onRegister}
        >
          Don’t have an account? Register
        </CardDescription>
      </div>

      <CardFooter className="pt-2 flex flex-col gap-4 w-full px-0">
        <Button type="submit" className="w-full h-10">
          Login
        </Button>
      <div className="flex items-center gap-2 w-full">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="text-sm text-gray-500 whitespace-nowrap">
            Or continue with
          </span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>
        <CardDescription className="text-center text-sm">
          By clicking continue, you agree to our Terms of Service and Privacy Policy.
        </CardDescription>
        <SocialButtons onClick={onSocialClick} />
      </CardFooter>
    </form>
  );
};
