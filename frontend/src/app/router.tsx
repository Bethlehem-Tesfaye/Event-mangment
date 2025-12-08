import { createBrowserRouter } from "react-router-dom";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import Events from "@/features/event/pages/Events";
import { EventPreview } from "@/features/event/pages/EventPreview";
import ProfilePage from "@/features/profile/pages/ProfilePage";
import OrgnaizerProfile from "@/features/profile/pages/OrgnaizerProfile";
import { ProtectedLayout } from "@/lib/ProtectedLayout";
import DashboardPage from "@/features/organizer/Dashboard/pages/DashboardPage";
import EventPreviewPage from "@/features/organizer/preview/pages/EventPreviewPage";
import OrganizerEventsListPage from "@/features/organizer/events/pages/OrganizerEventsListPage";
import CreateEventPage from "@/features/organizer/createEvents/pages/CreateEventPage";
import Settings from "@/features/settings/pages/Settings";
import OrgainzerSettings from "@/features/settings/pages/OrganizerSettings";
import Analytics from "@/features/organizer/analytics/pages/Analytics";
import Attendees from "@/features/organizer/attendees/pages/Attendees";
import NotFound from "@/components/custom/NotFound";
import UserRegistrationsPage from "@/features/event/pages/UserRegistrations";
import { VerifyNoticePage } from "@/features/auth/pages/VerifyNoticePage";
import { EmailVerifiedPage } from "@/features/auth/pages/EmailVerifiedPage";
import OAuthSuccessPage from "@/features/auth/pages/OAuthSuccessPage";
import RegistrationDetailsPage from "@/features/event/pages/RegistrationDetailsPage";
import EventAttendeesPage from "@/features/organizer/attendees/components/EventAttendeesPage";
import EventAnalyticsPage from "@/features/organizer/analytics/components/EventAnalyticsPage";
import NotificationPage from "@/features/notification/pages/NotificationPage";
import BrowseNotificationPage from "@/features/notification/pages/BrowseNotificationPage";
import OrganizerEventPreviewPage from "@/features/organizer/preview/pages/OrganizerEventPreviewPage";
import ForgotPassword from "@/features/auth/pages/ForgotPassword";
import ResetPassword from "@/features/auth/pages/ResetPassword";

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
    path: "/organizer/settings",
    element: <OrgainzerSettings />,
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
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },

  // Protected routes (profile + organizer)
  {
    path: "/",
    element: <ProtectedLayout />,
    children: [
      { path: "profile", element: <ProfilePage /> },
      { path: "organizer/profile", element: <OrgnaizerProfile /> },
      { path: "organizer/dashboard", element: <DashboardPage /> },
      { path: "organizer/events/:eventId", element: <EventPreviewPage /> },
      { path: "organizer/events", element: <OrganizerEventsListPage /> },
      { path: "organizer/create-event", element: <CreateEventPage /> },
      { path: "organizer/analytics", element: <Analytics /> },
      { path: "organizer/attendees", element: <Attendees /> },
      {
        path: "organizer/events/:eventId/analytics",
        element: <EventAnalyticsPage />,
      },
      {
        path: "organizer/events/attendees/:eventId",
        element: <EventAttendeesPage />,
      },
      {
        path: "registrations/:registrationId",
        element: <RegistrationDetailsPage />,
      },
      { path: "user/myevents", element: <UserRegistrationsPage /> },
      { path: "organizer/notifications", element: <NotificationPage /> },
      { path: "notifications", element: <BrowseNotificationPage /> },
      {
        path: "organizer/preview",
        element: <OrganizerEventPreviewPage />,
      },
    ],
    errorElement: <NotFound />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
