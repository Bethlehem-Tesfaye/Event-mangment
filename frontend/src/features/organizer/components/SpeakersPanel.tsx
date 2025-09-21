import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


export default function SpeakersPanel({ speakers, onAdd, onEdit }: { speakers: Array<{ id: number; name: string; bio?: string; photoUrl?: string }>; onAdd?: () => void; onEdit?: (id: number) => void }) {
return (
<Card>
<CardHeader>
<CardTitle>Speakers</CardTitle>
</CardHeader>
<CardContent>
<div className="flex justify-end mb-2">
<Button onClick={onAdd}>Add speaker</Button>
</div>


<div className="grid gap-2">
{speakers.map((s) => (
<div key={s.id} className="flex items-center justify-between border rounded-md p-3">
<div className="flex items-center gap-3">
<Avatar>
{s.photoUrl ? <AvatarImage src={s.photoUrl} /> : <AvatarFallback>👤</AvatarFallback>}
</Avatar>
<div>
<div className="font-semibold">{s.name}</div>
<div className="text-sm text-muted-foreground">{s.bio}</div>
</div>
</div>
<div>
<Button variant="ghost" onClick={() => onEdit?.(s.id)}>Edit</Button>
</div>
</div>
))}
</div>
</CardContent>
</Card>
);
}