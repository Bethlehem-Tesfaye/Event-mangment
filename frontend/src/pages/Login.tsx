import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import Logo from "@/components/custom/Logo";

const Login: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert(isRegister ? "Register submitted!" : "Login submitted!");
  };

  const handleSocialClick = (provider: string) => {
    alert(`${provider} ${isRegister ? "registration" : "login"} coming soon 🚀`);
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-100 py-4 px-2">
      <Card className="flex flex-col w-[1000px] max-w-lg h-full max-h-[800px] mt-20 shadow-lg p-6 gap-6">
        <CardHeader className="flex flex-col gap-4">
          <CardTitle className=" flex justify-center items-center text-base sm:text-md md:text-lg font-bold">
              <Logo/>EventLight
          </CardTitle>

          <CardTitle
            className="
              font-bold 
              text-2xl sm:text-3xl md:text-3xl lg:text-3xl 
              leading-snug
            "
          >
            Welcome! <br />
            {isRegister ? "Register your account" : "Login to your account"}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 h-full justify-between"
          >
            {/* Email */}
            <div className="flex flex-col gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                className="h-12"
                id="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="password">Password</Label>
              <Input
                className="h-12"
                id="password"
                type="password"
                placeholder="********"
                required
              />
              {!isRegister && (
                <div className="flex justify-end text-sm mt-1">
                  <CardDescription className="hover:text-blue-900 hover:cursor-pointer">
                    Forgot password?
                  </CardDescription>
                </div>
              )}
            </div>

            <div className="text-center">
              <CardDescription
                className="hover:text-blue-900 hover:cursor-pointer"
                onClick={() => setIsRegister(!isRegister)}
              >
                {isRegister
                  ? "Already have an account? Login"
                  : "Don’t have an account? Register"}
              </CardDescription>
            </div>
            <CardFooter className="pt-2 flex flex-col gap-4 w-full">
              <Button type="submit" className="w-full">
                {isRegister ? "Register" : "Login"}
              </Button>

              <div className="flex items-center gap-2 w-full">
                <div className="flex-1 h-px bg-gray-300" />
                <span className="text-sm text-gray-500">
                  or {isRegister ? "sign up" : "sign in"} with
                </span>
                <div className="flex-1 h-px bg-gray-300" />
              </div>
              <CardDescription className="text-center text-sm">
                By clicking Continue on Google, or Facebook icons, you agree to
                Eventlight's Terms of Service and Privacy Policy.
              </CardDescription>

              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  onClick={() => handleSocialClick("Google")}
                  className="p-3 rounded-full border border-gray-300 hover:bg-gray-100 transition"
                >
                  <FcGoogle size={22} />
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialClick("Facebook")}
                  className="p-3 rounded-full border border-gray-300 hover:bg-gray-100 transition text-blue-600"
                >
                  <FaFacebook size={22} />
                </button>
              </div>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
