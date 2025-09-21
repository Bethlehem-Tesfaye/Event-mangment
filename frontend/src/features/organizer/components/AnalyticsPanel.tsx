// organizer/components/AnalyticsPanel.tsx
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AnalyticsPanel({
  totalRevenue,
  totalTickets,
}: {
  totalRevenue: number;
  totalTickets: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Total revenue</div>
            <div className="text-2xl font-bold">${totalRevenue}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Tickets sold</div>
            <div className="text-2xl font-bold">{totalTickets}</div>
          </div>
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          (Charts would go here — use recharts)
        </div>
      </CardContent>
    </Card>
  );
}
