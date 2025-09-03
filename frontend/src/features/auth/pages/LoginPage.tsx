import React, { useState } from "react";
import { AuthLayout } from "../components/AuthLayout";
import { LoginForm } from "../components/LoginForm";
import { Navigate } from "react-router-dom";

export const LoginPage= () => {
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert("Login submitted!");
  };

  const handleSocialClick = (provider: string) => {
    alert(`${provider} login coming soon`);
  };

  if (isRegister) {
    return <Navigate to="/register" replace />;
  }

  return (
    <AuthLayout title="Login to your account">
      <LoginForm
        onSubmit={handleSubmit}
        onSocialClick={handleSocialClick}
        toggleRegister={() => setIsRegister(true)}
      />
    </AuthLayout>
  );
};
