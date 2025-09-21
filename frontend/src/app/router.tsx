import { createBrowserRouter } from "react-router-dom";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import Events from "@/features/event/pages/Events";
import { EventPreview } from "@/features/event/pages/EventPreview";
import DashboardPage from "@/features/organizer/pages/DashboardPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Events />,
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
    path: "/dasboard",
    element: <DashboardPage/>,
  },
]);
