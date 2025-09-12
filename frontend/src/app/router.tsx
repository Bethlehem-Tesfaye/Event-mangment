import { createBrowserRouter } from "react-router-dom";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import SplashScreen from "../components/SplashScreen";
import Events from "@/features/event/pages/Events";
import { EventPreview } from "@/features/event/pages/EventPreview";

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
    path: "/browse-event",
    element: <Events/>,
  },
  {
    path: "/events/:id",
    element: <EventPreview/>,
  },
  {
    path: "/browse-event",
    element: <Events/>,
  },
  {
    path: "/events/:id",
    element: <EventPreview/>,
  },
]);
