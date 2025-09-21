import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


export default function TicketsPanel({ tickets, onAdd, onEdit }: { tickets: Array<{ id: number; type: string; price: number; remaining: number }>; onAdd?: () => void; onEdit?: (id: number) => void }) {
return (
<Card>
<CardHeader>
<CardTitle>Tickets</CardTitle>
</CardHeader>
<CardContent>
<div className="flex justify-end mb-2">
<Button onClick={onAdd}>Add ticket</Button>
</div>


<div className="grid gap-2">
{tickets.map((t) => (
<div key={t.id} className="flex items-center justify-between border rounded-md p-3">
<div>
<div className="font-semibold">{t.type}</div>
<div className="text-sm text-muted-foreground">${t.price} • {t.remaining} left</div>
</div>
<div>
<Button variant="ghost" onClick={() => onEdit?.(t.id)}>Edit</Button>
</div>
</div>
))}
</div>
</CardContent>
</Card>
);
}