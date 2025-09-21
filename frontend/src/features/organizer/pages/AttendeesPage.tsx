// organizer/pages/AttendeesPage.tsx
import React from "react";
import AttendeesTable from "../components/AttendeesTable";


export default function AttendeesPage({ attendees, onExport }: { attendees: Array<{ id: number; name: string; email: string; ticketType: string; quantity: number }>; onExport?: () => void }) {
return (
<div className="p-6">
<h2 className="text-2xl font-bold mb-4">Attendees</h2>
<AttendeesTable attendees={attendees} onExport={onExport} />
</div>
);
}