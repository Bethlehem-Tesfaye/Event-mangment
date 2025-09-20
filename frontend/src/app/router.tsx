import { createBrowserRouter } from "react-router-dom";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import Events from "@/features/event/pages/Events";
import { EventPreview } from "@/features/event/pages/EventPreview";
import ProfilePage from "@/features/profile/pages/ProfilePage"; 
import { ProtectedLayout } from "@/lib/ProtectedLayout";


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
   // Protected routes
  {
    path: "/",
    element: <ProtectedLayout />,
    children: [
      { path: "profile", element: <ProfilePage /> },
    ],
  },
]);
