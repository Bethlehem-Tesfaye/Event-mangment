import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import SideBar from "../../Dashboard/components/SideBar";
import Topbar from "../../Dashboard/components/Topbar";
import { useOrganizerEvents } from "../../Dashboard/hooks/useEvents";
import { useUpdateEvent } from "../../Dashboard/hooks/useEvents";
import EventsTabBar from "../components/EventsTabBar";
import EventsList from "../../Dashboard/components/EventsList";
import { Card } from "@/components/ui/card";
import type { EventsTabBarTab } from "../types/eventsLists";
import { Link } from "react-router-dom";
import { toast } from "sonner"; // added
import { Button } from "@/components/ui/button";

const TABS: EventsTabBarTab[] = [
  { label: "All", value: "all" },
  { label: "Published", value: "published" },
  { label: "Draft", value: "draft" },
];
export default function OrganizerEventsListPage() {
  const [route, setRoute] = useState("events");
  const [tab, setTab] = useState("all");
  const { data: events = [], isLoading, error } = useOrganizerEvents(tab);
  const updateEvent = useUpdateEvent();

  // modal state for confirmation
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
    <div className="flex min-h-screen bg-muted">
      <SideBar active={route} onNavigate={setRoute} />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="p-6 flex-1 space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Your Events</h1>
            <Link to="/organizer/create-event">
              <Button>create event</Button>
            </Link>
          </div>

          <EventsTabBar tabs={TABS} value={tab} onChange={setTab} />

          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Card
                  key={i}
                  className="flex flex-col sm:flex-row items-center gap-4 p-3 rounded-xl shadow-sm"
                >
                  {/* Banner skeleton */}
                  <div className="flex-shrink-0 w-full sm:w-40 h-28 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                    <Skeleton className="w-full h-full" />
                  </div>
                  {/* Info skeleton */}
                  <div className="flex-1 flex flex-col gap-2 w-full max-w-2xl mx-auto">
                    <Skeleton className="h-6 w-1/2 mb-2" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-20 rounded-full" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                  {/* Button skeleton */}
                  <div className="mt-4 sm:mt-0 sm:ml-auto flex flex-col gap-2 w-20">
                    <Skeleton className="h-8 w-full rounded-md" />
                  </div>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-red-500">Failed to load events.</div>
          ) : (
            <>
              {/* Keep original design by using EventsList component */}
              <EventsList
                events={events}
                // optional prop: render action buttons beside each event item
                renderActions={(ev: any) => (
                  <div className="flex gap-2 ">
                    <Link
                      to={`/organizer/events/${ev.id}`}
                      className="px-3 py-1 bg-gray-300 border rounded text-sm"
                    >
                      View
                    </Link>

                    {/* Publish button only for events that are NOT published */}
                    {ev.status !== "published" && (
                      <button
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                        onClick={() =>
                          openConfirm(ev.id, "published", ev.title || "")
                        }
                        disabled={updateEvent.isPending}
                      >
                        Publish
                      </button>
                    )}

                    {/* Cancel / Delete button (show when not already cancelled) */}
                    {ev.status !== "cancelled" && (
                      <button
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                        onClick={() =>
                          openConfirm(ev.id, "cancelled", ev.title || "")
                        }
                        disabled={updateEvent.isPending}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              />
            </>
          )}
        </main>
      </div>

      {/* Simple confirmation modal */}
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
