import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SpeakerRow({
  speaker,
  editable,
  onChange,
  onDelete,
  onRemoteDelete,
  onFileChange,
}: {
  speaker: any;
  editable: boolean;
  onChange: (id: number | string, field: string, value: any) => void;
  onDelete: (id: number | string) => void;
  onRemoteDelete: (id: number) => void;
  onFileChange?: (id: number | string | "new", file?: File | null) => void;
}) {
  return (
    <div className="flex gap-2 items-center border p-2 rounded">
      <div className="flex items-center gap-3">
        <div>
          {speaker.photoPreview ? (
            <img
              src={speaker.photoPreview}
              className="h-12 w-12 rounded-full object-cover"
              alt="speaker"
            />
          ) : speaker.photoUrl ? (
            <img
              src={speaker.photoUrl}
              className="h-12 w-12 rounded-full object-cover"
              alt="speaker"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-gray-200" />
          )}
        </div>
      </div>

      <div className="flex-1 flex gap-2 items-center">
        {editable ? (
          <>
            <Input
              className="w-1/4"
              value={String(speaker.name)}
              onChange={(e) => onChange(speaker.id, "name", e.target.value)}
            />
            <Input
              className="w-1/4"
              value={String(speaker.bio ?? "")}
              onChange={(e) => onChange(speaker.id, "bio", e.target.value)}
            />
            <div className="w-1/4">
              <label className="block text-xs mb-1">Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  // update local preview/state
                  onChange(speaker.id, "photoFile", f);
                  onChange(
                    speaker.id,
                    "photoPreview",
                    f ? URL.createObjectURL(f) : speaker.photoUrl
                  );
                  onFileChange?.(speaker.id, f);
                }}
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(speaker.id)}
              >
                Remove
              </Button>
              {!speaker.isTemp && (
                <Button
                  size="sm"
                  onClick={() => onRemoteDelete(Number(speaker.id))}
                >
                  Delete
                </Button>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col">
              <div className="font-semibold">{speaker.name}</div>
              <div className="text-sm text-muted-foreground">{speaker.bio}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
