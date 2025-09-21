// organizer/components/EventEditorModal.tsx
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { Event } from "./EventCard";


export default function EventEditorModal({
open,
onClose,
initial,
onSave
}: {
open: boolean;
onClose: () => void;
initial?: Partial<Event>;
onSave: (payload: Partial<Event>) => void;
}) {
const [step, setStep] = useState(0);
const [title, setTitle] = useState(initial?.title || "");
const [startDate, setStartDate] = useState(initial?.startDate || "");
const [endDate, setEndDate] = useState(initial?.endDate || "");


useEffect(() => {
if (open) {
setTitle(initial?.title || "");
setStartDate(initial?.startDate || "");
setEndDate(initial?.endDate || "");
setStep(0);
}
}, [open, initial]);


return (
<Dialog open={open} onOpenChange={(o) => !o && onClose()}>
<DialogContent className="sm:max-w-3xl">
<DialogHeader>
<DialogTitle>{initial?.id ? "Edit event" : "Create event"}</DialogTitle>
</DialogHeader>


<div className="grid gap-4">
{step === 0 && (
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
<div>
<Label>Event title</Label>
<Input value={title} onChange={(e: any) => setTitle(e.target.value)} />
</div>
<div>
<Label>Banner (URL)</Label>
<Input defaultValue={initial?.banner} />
</div>
</div>
)}


{step === 1 && (
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
<div>
<Label>Start</Label>
<Input type="datetime-local" value={startDate} onChange={(e: any) => setStartDate(e.target.value)} />
</div>
<div>
<Label>End</Label>
<Input type="datetime-local" value={endDate} onChange={(e: any) => setEndDate(e.target.value)} />
</div>
</div>
)}


{step === 2 && (
<div>
<Label>Tickets</Label>
<div className="border rounded-md p-3">(Ticket UI goes here — use TicketsPanel component)</div>
</div>
)}
</div>
</DialogContent>
</Dialog>);
}