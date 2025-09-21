
// organizer/pages/EventEditPage.tsx
import React, { useState } from "react";
import EventEditorModal from "../components/EventEditorModal";
import type { Event } from "../components/EventCard";


export default function EventEditPage({ initial }: { initial?: Event }) {
const [open, setOpen] = useState(true);
return (
<div>
<EventEditorModal open={open} onClose={() => setOpen(false)} initial={initial} onSave={(p) => alert(JSON.stringify(p))} />
</div>
);
}