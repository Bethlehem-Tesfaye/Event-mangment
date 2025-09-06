import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Logo from "@/components/custom/Logo";
import type { AuthLayoutProps } from "../types/auth";
import { Link } from "react-router-dom";

export const AuthLayout: React.FC<AuthLayoutProps> = ({ title, children }) => {
  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-100 py-4 px-2">
      <Card className="flex flex-col w-[450px] max-w-lg h-full max-h-[600px] mt-20 shadow-lg p-5 gap-6">
        <CardHeader className="flex flex-col gap-4">
          <CardTitle className="flex justify-center items-center text-sm sm:text-base md:text-md font-bold">
            <Logo /> EventLight
          </CardTitle>
          <Link
            to="/dashboard"
            className="absolute top-5 right-5 text-[14px] text-blue-600 hover:text-blue-800 transition"
          >
            Skip
          </Link>
          <CardTitle className="font-bold text-xl sm:text-2xl md:text-2xl lg:text-2xl leading-snug">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1">{children}</CardContent>
      </Card>
    </div>
  );
};
