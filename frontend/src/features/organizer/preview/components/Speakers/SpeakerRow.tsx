import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Speaker } from "../../../types/organizer";

export default function SpeakerRow({
  speaker,
  editable,
  onChange,
  onDelete,
  onRemoteDelete,
}: {
  speaker: Speaker;
  editable: boolean;
  onChange: (id: number | string, field: string, value: any) => void;
  onDelete: (id: number | string) => void;
  onRemoteDelete: (id: number) => void;
}) {
  return (
    <div className="flex gap-2 items-center border p-2 rounded">
      {editable ? (
        <>
          <Input className="w-1/4" value={String(speaker.name)} onChange={(e) => onChange(speaker.id, "name", e.target.value)} />
          <Input className="w-1/4" value={String(speaker.bio ?? "")} onChange={(e) => onChange(speaker.id, "bio", e.target.value)} />
          <Input className="w-1/4" value={String(speaker.photoUrl ?? "")} onChange={(e) => onChange(speaker.id, "photoUrl", e.target.value)} />
          {(speaker as any).isTemp ? (
            <Button variant="destructive" size="sm" onClick={() => onDelete(speaker.id)}>Delete</Button>
          ) : (
            <Button variant="destructive" size="sm" onClick={() => onRemoteDelete(Number(speaker.id))}>Delete</Button>
          )}
        </>
      ) : (
        <>
          {speaker.photoUrl && <img src={speaker.photoUrl} className="w-12 h-12 rounded-full" alt={speaker.name} />}
          <div className="flex flex-col">
            <span className="font-semibold">{speaker.name}</span>
            {speaker.bio && <span className="text-sm text-muted-foreground">{speaker.bio}</span>}
          </div>
        </>
      )}
    </div>
  );
}