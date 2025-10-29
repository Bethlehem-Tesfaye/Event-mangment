import { createBrowserRouter, Route } from "react-router-dom";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import Events from "@/features/event/pages/Events";
import { EventPreview } from "@/features/event/pages/EventPreview";
import ProfilePage from "@/features/profile/pages/ProfilePage";
import { ProtectedLayout } from "@/lib/ProtectedLayout";

import DashboardPage from "@/features/organizer/Dashboard/pages/DashboardPage";
import EventPreviewPage from "@/features/organizer/preview/pages/EventPreviewPage";
import OrganizerEventsListPage from "@/features/organizer/events/pages/OrganizerEventsListPage";
import CreateEventPage from "@/features/organizer/createEvents/pages/CreateEventPage";
import Settings from "@/features/settings/pages/Settings";
import Analytics from "@/features/organizer/analytics/pages/Analytics";
import Attendees from "@/features/organizer/attendees/pages/Attendees";
import NotFound from "@/components/custom/NotFound";
import UserRegistrationsPage from "@/features/event/pages/UserRegistrations";
import { VerifyNoticePage } from "@/features/auth/pages/VerifyNoticePage";
import { EmailVerifiedPage } from "@/features/auth/pages/EmailVerifiedPage";
import OAuthSuccessPage from "@/features/auth/pages/OAuthSuccessPage";

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
    element: <Events />,
  },
  {
    path: "/events/:id",
    element: <EventPreview />,
  },

  {
    path: "/settings",
    element: <Settings />,
  },
  {
    path: "/verify-notice",
    element: <VerifyNoticePage />,
  },
  {
    path: "/verify-email",
    element: <EmailVerifiedPage />,
  },
  {
    path: "/auth/success",
    element: <OAuthSuccessPage />,
  },

  // Protected routes (profile + organizer)
  {
    path: "/",
    element: <ProtectedLayout />,
    children: [
      { path: "profile", element: <ProfilePage /> },
      { path: "organizer/dashboard", element: <DashboardPage /> },
      { path: "organizer/events/:eventId", element: <EventPreviewPage /> },
      { path: "organizer/events", element: <OrganizerEventsListPage /> },
      { path: "organizer/create-event", element: <CreateEventPage /> },
      { path: "organizer/analytics", element: <Analytics /> },
      { path: "organizer/attendees", element: <Attendees /> },
      { path: "user/myevents", element: <UserRegistrationsPage /> },
    ],
    errorElement: <NotFound />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
