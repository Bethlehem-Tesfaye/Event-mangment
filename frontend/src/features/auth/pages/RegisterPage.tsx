import React from "react";
import { AuthLayout } from "../components/AuthLayout";
import { RegisterForm } from "../components/RegisterForm";
import { useState } from "react";
import { Navigate} from 'react-router-dom'

export const RegisterPage = () => {
  const [isLogin, setIsLogin] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert("Register submitted!");
  };

  const handleSocialClick = (provider: string) => {
    alert(`${provider} registration coming soon`);
  };

  if (isLogin) {
    return <Navigate to="/" replace />;
  }

  return (
    <AuthLayout title="Register your account">
      <RegisterForm
        onSubmit={handleSubmit}
        onSocialClick={handleSocialClick}
        toggleLogin={() => setIsLogin(true)}
      />
    </AuthLayout>
  );
};
