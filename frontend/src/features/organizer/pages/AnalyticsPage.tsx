// organizer/pages/AnalyticsPage.tsx
import React from "react";
import AnalyticsPanel from "../components/AnalyticsPanel";

export default function AnalyticsPage({
  totalRevenue,
  totalTickets,
}: {
  totalRevenue: number;
  totalTickets: number;
}) {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Analytics</h2>
      <AnalyticsPanel totalRevenue={totalRevenue} totalTickets={totalTickets} />
    </div>
  );
}
