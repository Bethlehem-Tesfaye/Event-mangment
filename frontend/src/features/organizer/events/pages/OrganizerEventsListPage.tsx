import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import SideBar from "../../Dashboard/components/SideBar";
import Topbar from "../../Dashboard/components/Topbar";
import { useOrganizerEvents } from "../../Dashboard/hooks/useEvents";
import { useUpdateEvent } from "../../Dashboard/hooks/useEvents";
import EventsList from "../../Dashboard/components/EventsList";
import type { EventsTabBarTab } from "../types/eventsLists";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import AttendeesEventsList from "@/features/organizer/attendees/components/AttendeesEventsList";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { Plus } from "lucide-react";

const TABS: EventsTabBarTab[] = [
  { label: "All", value: "all" },
  { label: "Published", value: "published" },
  { label: "Draft", value: "draft" },
];

export default function OrganizerEventsListPage() {
  const [route, setRoute] = useState("events");
  const [tab, setTab] = useState("all");
  const [queryInput, setQueryInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [section, setSection] = useState<"events" | "attendees">("events");
  const {
    data: events = [],
    isLoading,
    error,
  } = useOrganizerEvents(tab, searchQuery);
  const updateEvent = useUpdateEvent();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useCurrentUser();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sectionParam = params.get("section") as "events" | "attendees";
    if (sectionParam) setSection(sectionParam);
  }, [location.search]);

  // update searchQuery on every keystroke with debounce so useOrganizerEvents refetches
  useEffect(() => {
    const t = setTimeout(() => {
      setSearchQuery(queryInput.trim());
    }, 300); // 300ms debounce
    return () => clearTimeout(t);
  }, [queryInput]);

  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    eventId: number | string | null;
    action: "published" | "cancelled" | null;
    title?: string;
  }>({ open: false, eventId: null, action: null });

  const openConfirm = (
    eventId: number | string,
    action: "published" | "cancelled",
    title?: string
  ) => setConfirmModal({ open: true, eventId, action, title });

  const closeConfirm = () =>
    setConfirmModal({ open: false, eventId: null, action: null });

  const handleConfirm = async () => {
    if (!confirmModal.eventId || !confirmModal.action) return;
    const evId = confirmModal.eventId;
    const status = confirmModal.action;
    closeConfirm();
    const t = toast.loading(
      `${status === "published" ? "Publishing" : "Cancelling"} event...`
    );
    updateEvent.mutate(
      { eventId: evId, status },
      {
        onSuccess: () => {
          toast.dismiss(t);
          toast.success(
            `Event ${status === "published" ? "published" : "cancelled"}`
          );
        },
        onError: (err: any) => {
          toast.dismiss(t);
          const msg =
            err?.response?.data?.message || err?.message || "Action failed";
          toast.error(msg);
        },
      }
    );
  };

  return (
    <div className="flex min-h-screen  bg-gray-50 dark:bg-[#050505]">
      <SideBar active={route} onNavigate={setRoute} />
      <div className="flex-1 flex flex-col md:pl-56">
        <Topbar user={user} />
        <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-10 px-1">
              <button
                onClick={() => setSection("events")}
                className={`relative px-4 py-2 text-center text-sm font-medium rounded-md transition-colors
        ${
          section === "events"
            ? "text-black dark:text-white "
            : "text-gray-500 hover:text-black dark:hover:text-white"
        }`}
              >
                Events
                {section === "events" && (
                  <span className="absolute left-1/2 -translate-x-1/2 -bottom-[2px] w-[140%] h-[2px] bg-red-700 rounded-full"></span>
                )}
              </button>

              <button
                onClick={() => setSection("attendees")}
                className={`relative px-4 py-2 text-center text-sm font-medium rounded-md transition-colors
        ${
          section === "attendees"
            ? "text-black dark:text-white"
            : "text-gray-500 hover:text-black dark:hover:text-white"
        }`}
              >
                Attendees
                {section === "attendees" && (
                  <span className="absolute left-1/2 -translate-x-1/2 -bottom-[2px] w-[140%] h-[2px] bg-red-700 rounded-full"></span>
                )}
              </button>
            </div>
          </div>

          {section === "events" ? (
            <div className="ml-3">
              <div className="flex justify-between items-center">
                <div className="flex-1" />
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="search"
                      value={queryInput}
                      onChange={(e) => setQueryInput(e.target.value)}
                      placeholder="Search events"
                      className="min-w-[220px] px-3 py-2 border rounded-md text-sm bg-white dark:bg-[#0b0b0b] dark:border-neutral-800"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="status-filter"
                      className="text-xs text-neutral-600 hidden"
                    >
                      Status
                    </label>
                    <div className="relative">
                      <select
                        id="status-filter"
                        value={tab}
                        onChange={(e) => setTab(e.target.value)}
                        className="appearance-none bg-white dark:bg-[#0b0b0b] border border-neutral-200 dark:border-neutral-800 rounded-md px-3 py-2 pr-8 text-sm shadow-sm"
                      >
                        {TABS.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                      <svg
                        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6 8l4 4 4-4"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>

                  <Link to="/organizer/create-event">
                    <Button className="cursor-pointer inline-flex items-center gap-2">
                      <Plus /> Create Event
                    </Button>
                  </Link>
                </div>
              </div>

              {isLoading ? (
                <div className="w-full overflow-x-auto opacity-100 rounded-[6px] shadow-none">
                  <table className="w-full text-sm border-separate border-spacing-y-[2px] p-4">
                    <thead className="text-muted-foreground text-left">
                      <tr>
                        <th className="py-2 px-4 font-medium">Event Name</th>
                        <th className="py-2 px-4 font-medium">Status</th>
                        <th className="py-2 px-4 font-medium">Location Type</th>
                        <th className="py-2 px-4 font-medium">Event Date</th>
                        <th className="py-2 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {[1, 2, 3, 4].map((i) => (
                        <tr
                          key={i}
                          className="bg-white dark:dark:bg-[#202127]  shadow-sm rounded-lg transition"
                        >
                          <td className="py-4 px-4 font-medium">
                            <Skeleton className="h-5 w-48" />
                          </td>

                          <td className="py-4 px-4">
                            <Skeleton className="h-5 w-20 rounded-full" />
                          </td>

                          <td className="py-4 px-4 text-muted-foreground">
                            <Skeleton className="h-4 w-24" />
                          </td>

                          <td className="py-4 px-4 text-muted-foreground">
                            <Skeleton className="h-4 w-28" />
                          </td>

                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Skeleton className="h-8 w-8 rounded" />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : error ? (
                <div className="text-red-500">Failed to load events.</div>
              ) : (
                <div className="mt-4">
                  <EventsList
                    events={events}
                    onRowClick={(ev: any) =>
                      navigate(`/organizer/events/${ev.id}`)
                    }
                    onPublish={(ev: any) =>
                      openConfirm(ev.id, "published", ev.title)
                    }
                    onDelete={(ev: any) =>
                      openConfirm(ev.id, "cancelled", ev.title)
                    }
                    setAction={true}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="ml-3 mt-16">
              <AttendeesEventsList />
            </div>
          )}
        </main>
      </div>

      {confirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeConfirm}
            aria-hidden
          />
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 z-10 w-11/12 max-w-md">
            <h3 className="text-lg font-semibold mb-2">Confirm action</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Are you sure you want to{" "}
              <span className="font-medium">
                {confirmModal.action === "published" ? "publish" : "cancel"}
              </span>{" "}
              the event{" "}
              <span className="font-semibold">
                {confirmModal.title ?? confirmModal.eventId}
              </span>
              ?
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1 bg-gray-200 rounded"
                onClick={closeConfirm}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 bg-blue-600 text-white rounded"
                onClick={handleConfirm}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
