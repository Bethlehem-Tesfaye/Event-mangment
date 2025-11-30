import { Button } from "@/components/ui/button";
import { Trash2, Camera } from "lucide-react";
import type { Speaker } from "../../../types/organizer";
import { useEffect, useState } from "react";
import { createSpeakerSchema } from "@/schemas/speaker";

export default function SpeakerRow({
  speaker,
  editable,
  onChange,
  onDelete,
  onFileChange,
}: {
  speaker: Speaker;
  editable: boolean;
  onChange: (id: number | string, field: string, value: any) => void;
  onDelete: (id: number | string) => void;
  onRemoteDelete?: (id: number) => void;
  onFileChange?: (id: number | string | "new", file?: File | null) => void;
}) {
  const handleDelete = () => {
    const id = speaker.id as any;
    onDelete(id);
  };

  const initials = (name?: string) =>
    (name || "")
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const hasImage = Boolean((speaker as any).photoPreview || speaker.photoUrl);

  // per-row validation errors (works for both create/new and update rows)
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // prefer create schema to require name in the UI; for existing rows you can
    // also use updateSpeakerSchema if you want different rules for server updates.
    const payload = {
      name: String(speaker.name ?? ""),
      bio: speaker.bio ?? undefined,
      photoUrl:
        (speaker as any).photoUrl === "" ||
        (speaker as any).photoUrl === null ||
        (speaker as any).photoUrl === undefined
          ? undefined
          : String((speaker as any).photoUrl),
    };

    // Use createSpeakerSchema to enforce friendly UI validation (name required).
    const parsed = createSpeakerSchema.safeParse(payload);
    if (parsed.success) {
      setErrors({});
      return;
    }
    const map: Record<string, string> = {};
    parsed.error.issues.forEach((iss) => {
      const p = iss.path?.[0];
      if (typeof p === "string" && !map[p]) map[p] = iss.message;
      else map["_"] = (map["_"] ? map["_"] + " • " : "") + iss.message;
    });
    setErrors(map);
  }, [speaker]);

  return (
    <div className="hidden sm:grid grid-cols-12 gap-2 items-center py-2">
      <div className="col-span-4">
        {editable ? (
          <>
            <input
              className="w-full px-2 py-1 rounded border"
              value={speaker.name ?? ""}
              onChange={(e) => onChange(speaker.id, "name", e.target.value)}
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </>
        ) : (
          <span>{speaker.name}</span>
        )}
      </div>

      <div className="col-span-5">
        {editable ? (
          <>
            <input
              className="w-full px-2 py-1 rounded border"
              value={speaker.bio ?? ""}
              onChange={(e) => onChange(speaker.id, "bio", e.target.value)}
              aria-invalid={Boolean(errors.bio)}
            />
            {errors.bio && (
              <p className="text-red-500 text-sm mt-1">{errors.bio}</p>
            )}
          </>
        ) : (
          <span>{speaker.bio ?? "—"}</span>
        )}
      </div>

      <div className="col-span-2">
        {editable ? (
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center gap-2 cursor-pointer group">
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  const preview = f ? URL.createObjectURL(f) : null;
                  onChange(speaker.id, "photoFile", f);
                  onChange(speaker.id, "photoPreview", preview);
                  onFileChange?.(speaker.id, f ?? null);
                }}
              />

              <div className="relative">
                {hasImage ? (
                  <img
                    src={
                      (speaker as any).photoPreview ?? speaker.photoUrl ?? ""
                    }
                    alt={speaker.name ?? "speaker"}
                    className="h-10 w-10 rounded-full object-cover border"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-sm font-medium text-neutral-600 border">
                    {initials(speaker.name)}
                  </div>
                )}
                <span
                  className={
                    "absolute inset-0 rounded-full flex items-center justify-center text-xs font-medium text-white transition-opacity duration-150 " +
                    (hasImage
                      ? "bg-black/40 opacity-0 group-hover:opacity-100"
                      : "bg-black/40 opacity-100")
                  }
                >
                  <Camera size={14} />
                </span>
              </div>
            </label>
          </div>
        ) : speaker.photoUrl ? (
          <img
            src={speaker.photoUrl}
            alt="photo"
            className="h-14 w-14 rounded-full object-cover border"
          />
        ) : (
          <div className="h-14 w-14 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-sm text-neutral-500 border">
            {initials(speaker.name)}
          </div>
        )}
        {errors.photoUrl && (
          <p className="text-red-500 text-sm mt-1">{errors.photoUrl}</p>
        )}
      </div>

      <div className="col-span-1 text-right flex justify-end gap-2">
        {editable && (
          <Button
            size="sm"
            variant="destructive"
            onClick={handleDelete}
            title="Delete"
          >
            <Trash2 size={14} />
          </Button>
        )}
      </div>
    </div>
  );
}
