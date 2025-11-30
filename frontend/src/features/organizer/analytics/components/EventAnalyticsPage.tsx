"use client";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useEventAnalytics } from "@/features/organizer/analytics/hooks/useAnalytics";
import Sidebar from "../../Dashboard/components/SideBar";
import Topbar from "../../Dashboard/components/Topbar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

export default function EventAnalyticsPage() {
  const { eventId } = useParams<{ eventId?: string }>();
  const id = eventId ?? undefined;

  const { data, isLoading, error } = useEventAnalytics(id);
  const [route, setRoute] = useState("analytics");
  const { user } = useCurrentUser();

  return (
    <div className="space-y-8 min-h-screen bg-gray-50 dark:bg-[#050505]  md:pl-56">
      <Sidebar active={route} onNavigate={setRoute} />
      <div className="flex-1 flex flex-col gap-4">
        <Topbar user={user} />
        <main className="p-6 max-w-7xl w-full mx-auto flex flex-col flex-1 gap-6">
          <div className="flex items-center gap-4">
            <Link
              to={`/organizer/analytics`}
              className="text-sm text-blue-600 hover:underline"
            >
              ← Back
            </Link>
          </div>
          <h1 className="text-3xl font-bold">Event Analytics</h1>

          <Card className="p-6 rounded-2xl">
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : error ? (
              <p className="text-red-500">Failed to load analytics.</p>
            ) : !data ? (
              <p className="text-muted-foreground">No analytics available.</p>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 gap-8 mb-8">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Total Revenue
                    </div>
                    <div className="font-medium">
                      ${data.totalRevenue.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Tickets Sold
                    </div>
                    <div className="font-medium">{data.totalTicketsSold}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-2">
                    By ticket
                  </div>
                  <div className="space-y-2">
                    {data.tickets.map((t) => (
                      <div
                        key={t.ticket_type}
                        className="flex justify-between text-sm"
                      >
                        <div>{t.ticket_type}</div>
                        <div className="text-muted-foreground">
                          {t.tickets_sold} sold • ${t.revenue.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}
