import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";


export type Event = {
id: number;
title: string;
status: "draft" | "published" | "cancelled";
startDate: string;
endDate: string;
attendees: number;
revenue: number;
banner?: string;
};


export default function EventCard({
e,
onEdit,
onPublish,
onDelete
}: {
e: Event;
onEdit: (id: number) => void;
onPublish: (id: number) => void;
onDelete: (id: number) => void;
}) {
return (
<Card className="p-4">
<CardContent className="flex gap-4 items-start">
<div className="w-20 h-20 rounded-md bg-muted flex items-center justify-center text-sm">Banner</div>
<div className="flex-1">
<div className="flex items-center justify-between gap-4">
<div>
<div className="text-lg font-semibold">{e.title}</div>
<div className="text-sm text-muted-foreground">{new Date(e.startDate).toLocaleString()}</div>
</div>
<div className="text-right">
<Badge variant={e.status === "published" ? "outline" : e.status === "draft" ? "secondary" : "destructive"}>{e.status}</Badge>
</div>
</div>


<div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
<div>👥 {e.attendees} attendees</div>
<div>💰 ${e.revenue}</div>
</div>


<div className="mt-3 flex gap-2">
<Button variant="ghost" size="sm" onClick={() => onEdit(e.id)}>
Edit
</Button>
{e.status === "draft" && (
<Button size="sm" onClick={() => onPublish(e.id)}>
Publish
</Button>
)}
<Button variant="destructive" size="sm" onClick={() => onDelete(e.id)}>
Delete
</Button>
</div>
</div>
</CardContent>
</Card>
);
}