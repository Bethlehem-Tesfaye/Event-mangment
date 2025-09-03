import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Logo from "@/components/custom/Logo";
import type { AuthLayoutProps } from "../types/auth";

export const AuthLayout: React.FC<AuthLayoutProps> = ({ title, children }) => {
  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-100 py-4 px-2">
      <Card className="flex flex-col w-[1000px] max-w-lg h-full max-h-[800px] mt-20 shadow-lg p-6 gap-6">
        <CardHeader className="flex flex-col gap-4">
          <CardTitle className="flex justify-center items-center text-base sm:text-md md:text-lg font-bold">
            <Logo /> EventLight
          </CardTitle>
          <CardTitle className="font-bold text-2xl sm:text-3xl md:text-3xl lg:text-3xl leading-snug">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1">{children}</CardContent>
      </Card>
    </div>
  );
};
