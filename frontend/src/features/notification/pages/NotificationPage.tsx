import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useLogout } from "@/features/auth/hooks/useLogout";
import Sidebar from "@/features/organizer/Dashboard/components/SideBar";
import Topbar from "@/features/organizer/Dashboard/components/Topbar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../hooks/useNotification";
import {
  Bell as BellIcon,
  CalendarPlus,
  Ticket,
  CheckCircle,
  XCircle,
  MessageCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  formatDistanceToNow,
  isToday,
  isYesterday,
  isThisWeek,
} from "date-fns";

function NotificationPage() {
  const [route, setRoute] = useState<string>("dashboard");
  const { user } = useCurrentUser();
  const { mutate: logout } = useLogout();
  const { data } = useNotification();
  const notifications = data ?? [];
  const navigate = useNavigate();
  const [openGroups, setOpenGroups] = useState({
    today: true,
    yesterday: true,
    week: false,
    earlier: false,
  });

  const toggleGroup = (key: keyof typeof openGroups) => {
    setOpenGroups((s) => ({ ...s, [key]: !s[key] }));
  };

  const grouped = notifications.reduce(
    (acc: Record<string, any[]>, notif: any) => {
      const createdAt = notif?.createdAt ? new Date(notif.createdAt) : null;
      let bucket = "earlier";

      if (createdAt) {
        if (isToday(createdAt)) bucket = "today";
        else if (isYesterday(createdAt)) bucket = "yesterday";
        else if (isThisWeek(createdAt)) bucket = "week";
        else bucket = "earlier";
      }

      acc[bucket] = acc[bucket] || [];
      acc[bucket].push(notif);
      return acc;
    },
    { today: [], yesterday: [], week: [], earlier: [] }
  );

  // Sort each group by createdAt desc
  Object.keys(grouped).forEach((k) => {
    grouped[k].sort((a: any, b: any) => {
      const ta = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });
  });

  const sections = [
    { key: "today", title: "Today" },
    { key: "yesterday", title: "Yesterday" },
    { key: "week", title: "This Week" },
    { key: "earlier", title: "Earlier" },
  ] as const;

  const nonEmptySections = sections.filter(
    (s) => (grouped[s.key] || []).length > 0
  );
  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        navigate("/");
      },
      onError: (err) => {
        console.error("Logout failed:", err);
      },
    });
  };
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#050505]  md:pl-56">
      <Sidebar active={route} onNavigate={setRoute} />
      <div className="flex-1 flex flex-col">
        <Topbar user={user} onLogout={handleLogout} />
        <main className="p-6 max-w-7xl w-full mx-auto flex-1">
          <h1>Notifications</h1>
          <div className="space-y-6 mt-4">
            {nonEmptySections.length === 0 && (
              <div className="text-sm text-gray-500">No notifications</div>
            )}

            {/* Section helper to render a header + list */}
            {nonEmptySections.map((section) => {
              const items = grouped[section.key] || [];
              const isOpen = openGroups[section.key as keyof typeof openGroups];
              return (
                <section
                  key={section.key}
                  className="border rounded-lg overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() =>
                      toggleGroup(section.key as keyof typeof openGroups)
                    }
                    className="w-full flex items-center justify-between p-3 bg-white dark:bg-gray-900"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{section.title}</span>
                      <span className="text-sm text-gray-400">
                        {items.length}
                      </span>
                    </div>
                    <div className="text-gray-400">
                      {isOpen ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <ul className="divide-y bg-white dark:bg-gray-900">
                      {items.length === 0 && (
                        <li className="p-4 text-sm text-gray-500">
                          No notifications
                        </li>
                      )}
                      {items.map((notif: any) => {
                        const createdAt = notif?.createdAt
                          ? new Date(notif.createdAt)
                          : null;

                        const getIcon = (type: string | undefined) => {
                          switch (type) {
                            case "event_created":
                              return <CalendarPlus className="w-5 h-5" />;
                            case "ticket_purchased":
                              return <Ticket className="w-5 h-5" />;
                            case "event_published":
                              return <CheckCircle className="w-5 h-5" />;
                            case "event_cancelled":
                              return <XCircle className="w-5 h-5" />;
                            case "notification":
                              return <BellIcon className="w-5 h-5" />;
                            default:
                              return <MessageCircle className="w-5 h-5" />;
                          }
                        };

                        const { type } = notif || {};

                        const colorClasses = (() => {
                          switch (type) {
                            case "event_created":
                              return {
                                border: "border-blue-300",
                                bg: "bg-blue-50",
                                text: "text-blue-600",
                              };
                            case "ticket_purchased":
                              return {
                                border: "border-amber-300",
                                bg: "bg-amber-50",
                                text: "text-amber-600",
                              };
                            case "event_published":
                              return {
                                border: "border-green-300",
                                bg: "bg-green-50",
                                text: "text-green-600",
                              };
                            case "event_cancelled":
                              return {
                                border: "border-red-400",
                                bg: "bg-red-100",
                                text: "text-red-700",
                              };
                            default:
                              return {
                                border: "border-slate-300",
                                bg: "bg-slate-50",
                                text: "text-slate-600",
                              };
                          }
                        })();

                        const handleClick = async () => {
                          console.log("notification clicked", {
                            id: notif.id,
                            eventId: notif.eventId,
                            type: notif.type,
                          });

                          if (notif.type === "event_created" && notif.eventId) {
                            navigate(`/organizer/events/${notif.eventId}`);
                          } else if (
                            notif.type === "ticket_purchased" &&
                            notif.eventId
                          ) {
                            navigate(
                              `/organizer/events/attendees/${notif.eventId}`
                            );
                          } else {
                            return;
                          }
                        };

                        return (
                          <li
                            key={notif.id}
                            onClick={handleClick}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ")
                                handleClick();
                            }}
                            className={`relative cursor-pointer overflow-hidden p-4 hover:bg-gray-50 dark:hover:bg-gray-800`}
                          >
                            <div
                              className={`absolute left-0 top-0 bottom-0 w-1 ${colorClasses.border.replace(
                                "border-",
                                "bg-"
                              )} pointer-events-none`}
                              aria-hidden
                            />

                            <div className="flex items-start gap-3">
                              <div
                                className={`flex-none w-12 h-12 rounded-full flex items-center justify-center ${colorClasses.bg} ${colorClasses.text}`}
                              >
                                {getIcon(type)}
                              </div>

                              <div className="flex-1">
                                <div className="flex items-center justify-between gap-4">
                                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                    {notif.title ?? "Notification"}
                                  </h3>
                                  <time className="text-xs text-gray-400">
                                    {createdAt
                                      ? formatDistanceToNow(createdAt, {
                                          addSuffix: true,
                                        })
                                      : ""}
                                  </time>
                                </div>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                  {notif.message}
                                </p>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}

export default NotificationPage;
