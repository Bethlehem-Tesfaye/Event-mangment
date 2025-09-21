import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";


export default function AttendeesTable({ attendees, onExport }: { attendees: Array<{ id: number; name: string; email: string; ticketType: string; quantity: number }>; onExport?: () => void }) {
return (
<div>
<div className="flex items-center justify-between mb-2">
<h3 className="text-lg font-bold">Attendees</h3>
<Button onClick={onExport}>Export CSV</Button>
</div>


<Table>
<TableHeader>
<TableRow>
<TableHead>#</TableHead>
<TableHead>Name</TableHead>
<TableHead>Email</TableHead>
<TableHead>Ticket</TableHead>
<TableHead>Qty</TableHead>
</TableRow>
</TableHeader>
<TableBody>
{attendees.map((a, idx) => (
<TableRow key={a.id}>
<TableCell>{idx + 1}</TableCell>
<TableCell>{a.name}</TableCell>
<TableCell>{a.email}</TableCell>
<TableCell>{a.ticketType}</TableCell>
<TableCell>{a.quantity}</TableCell>
</TableRow>
))}
</TableBody>
</Table>
</div>
);
}