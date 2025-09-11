import { createBrowserRouter } from "react-router-dom";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import Dashboard from "@/features/dashboard/Dashboard";
import SplashScreen from "../components/SplashScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <SplashScreen />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
]);
