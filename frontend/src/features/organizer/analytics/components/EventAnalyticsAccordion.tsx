import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEventAnalytics } from "../hooks/useAnalytics";

type Props = {
  event: any;
};

export default function EventAnalyticsAccordion({ event }: Props) {
  const [open, setOpen] = useState(false);
  const { data, isLoading, error } = useEventAnalytics(
    open ? event.id : undefined
  );

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="font-semibold text-lg">{event.title}</div>
          <div className="text-sm text-muted-foreground">
            {event.eventCategories
              ?.map((c: any) => c.category?.name)
              .join(", ") || ""}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setOpen((s) => !s)}>
            {open ? "Hide analytics" : "Show analytics"}
          </Button>
        </div>
      </div>

      {open && (
        <div className="mt-4">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : error ? (
            <div className="text-red-500">Failed to load analytics.</div>
          ) : data ? (
            <div className="grid gap-3">
              <div className="flex gap-6">
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
            </div>
          ) : (
            <div className="text-muted-foreground">No analytics available.</div>
          )}
        </div>
      )}
    </Card>
  );
}
