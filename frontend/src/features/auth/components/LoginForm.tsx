import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CardDescription, CardFooter } from "@/components/ui/card";
import { SocialButtons } from "./SocialButtons";
import type { LoginFormProps } from "../types/auth";

export const LoginForm = ({ onSubmit, onSocialClick, toggleRegister }:LoginFormProps) => {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 h-full justify-between">
      <div className="flex flex-col gap-3">
        <Label htmlFor="email">Email</Label>
        <Input className="h-12" id="email" type="email" placeholder="you@example.com" required />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="password">Password</Label>
        <Input className="h-12" id="password" type="password" placeholder="********" required />
        <div className="flex justify-end text-sm mt-1">
          <CardDescription className="hover:text-blue-900 hover:cursor-pointer">
            Forgot password?
          </CardDescription>
        </div>
      </div>

      <div className="text-center">
        <CardDescription className="hover:text-blue-900 hover:cursor-pointer" onClick={toggleRegister}>
          Don’t have an account? Register
        </CardDescription>
      </div>

      <CardFooter className="pt-2 flex flex-col gap-4 w-full">
        <Button type="submit" className="w-full">
          Login
        </Button>

        <div className="flex items-center gap-2 w-full">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="text-sm text-gray-500">or sign in with</span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        <CardDescription className="text-center text-sm">
          By clicking Continue on Google, or Facebook icons, you agree to Eventlight's Terms of Service and Privacy Policy.
        </CardDescription>

        <SocialButtons onClick={onSocialClick} />
      </CardFooter>
    </form>
  );
};
