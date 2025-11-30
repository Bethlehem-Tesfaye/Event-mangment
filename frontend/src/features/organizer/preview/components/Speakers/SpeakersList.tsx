import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SpeakerRow from "./SpeakerRow";
import type { Speaker } from "../../../types/organizer";
import { PlusCircle, Camera } from "lucide-react";
import { useMemo } from "react";
import { createSpeakerSchema } from "@/schemas/speaker";

export default function SpeakersList({
  speakers,
  editable,
  newSpeaker,
  setNewSpeaker,
  onAddLocal,
  onChangeSpeaker,
  onRemoveLocal,
  onRemoteDelete,
  onFileChange,
  error,
}: {
  speakers: Speaker[];
  editable: boolean;
  newSpeaker: any;
  setNewSpeaker: (v: any) => void;
  onAddLocal: () => void;
  onChangeSpeaker: (id: number | string, field: string, value: any) => void;
  onRemoveLocal: (type: "ticket" | "speaker", id: string | number) => void;
  onRemoteDelete: (id: number) => void;
  onFileChange?: (id: number | string | "new", file?: File | null) => void;
  error?: string | null;
}) {
  // validate newSpeaker inline and map messages to fields
  const newSpeakerErrors = useMemo(() => {
    if (!newSpeaker) return {};
    const parsed = createSpeakerSchema.safeParse({
      name: String(newSpeaker.name ?? ""),
      bio: newSpeaker.bio ?? undefined,
      photoUrl:
        newSpeaker.photoUrl === "" ||
        newSpeaker.photoUrl === null ||
        newSpeaker.photoUrl === undefined
          ? undefined
          : String(newSpeaker.photoUrl),
    });
    if (parsed.success) return {};
    const map: Record<string, string> = {};
    parsed.error.issues.forEach((iss) => {
      const p = iss.path?.[0];
      if (typeof p === "string") {
        if (!map[p]) map[p] = iss.message;
      } else {
        map["_"] = (map["_"] ? map["_"] + " • " : "") + iss.message;
      }
    });
    return map;
  }, [newSpeaker]);

  const initials = (name?: string) =>
    (name || "")
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <Card className="shadow-none border dark:border-neutral-800">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-base">Speakers</CardTitle>
        {editable && !newSpeaker && (
          <Button
            size="sm"
            onClick={() => setNewSpeaker({ name: "" })}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-1"
          >
            <PlusCircle size={14} /> Add Speaker
          </Button>
        )}
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {editable && (
          <div className="hidden sm:grid grid-cols-12 gap-2 font-semibold text-sm text-neutral-600 dark:text-neutral-300 border-b pb-2">
            <div className="col-span-4">Name</div>
            <div className="col-span-5">Bio</div>
            <div className="col-span-2">Photo</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {speakers.map((s) => (
            <SpeakerRow
              key={s.id}
              speaker={s}
              editable={editable}
              onChange={onChangeSpeaker}
              onDelete={(id) => onRemoveLocal("speaker", id)}
              onRemoteDelete={onRemoteDelete}
              onFileChange={onFileChange}
            />
          ))}
        </div>

        {newSpeaker && editable && (
          <div className="flex flex-col sm:grid sm:grid-cols-12 gap-2 items-start border rounded-lg p-3">
            <div className="w-full sm:col-span-4 flex flex-col">
              <input
                className="w-full px-3 py-2 rounded-md border dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
                placeholder="Name"
                value={newSpeaker.name}
                onChange={(e) =>
                  setNewSpeaker({ ...newSpeaker, name: e.target.value })
                }
              />
              {newSpeakerErrors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {newSpeakerErrors.name}
                </p>
              )}
            </div>
            <div className="w-full sm:col-span-5">
              <input
                className="w-full px-3 py-2 rounded-md border dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
                placeholder="Bio"
                value={newSpeaker.bio || ""}
                onChange={(e) =>
                  setNewSpeaker({ ...newSpeaker, bio: e.target.value })
                }
              />
            </div>

            <div className="w-full sm:col-span-2 flex flex-col items-start">
              <label className="relative inline-flex items-center gap-2 cursor-pointer group">
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    const preview = f ? URL.createObjectURL(f) : undefined;
                    setNewSpeaker({
                      ...newSpeaker,
                      photoFile: f,
                      photoPreview: preview,
                    });
                    onFileChange?.("new", f);
                  }}
                />

                <div className="relative">
                  {newSpeaker.photoPreview ? (
                    <img
                      src={newSpeaker.photoPreview}
                      alt="preview"
                      className="h-10 w-10 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-sm font-medium text-neutral-600 border">
                      {initials(newSpeaker.name)}
                    </div>
                  )}

                  <span
                    className={
                      "absolute inset-0 rounded-full flex items-center justify-center text-xs font-medium text-white transition-opacity duration-150 " +
                      (newSpeaker.photoPreview
                        ? "bg-black/40 opacity-0 group-hover:opacity-100"
                        : "bg-black/40 opacity-100")
                    }
                  >
                    <Camera size={14} />
                  </span>
                </div>
              </label>
              {/* photoUrl validation if user enters URL (if you expose a field for it) */}
              {newSpeakerErrors.photoUrl && (
                <p className="text-red-500 text-sm mt-1">
                  {newSpeakerErrors.photoUrl}
                </p>
              )}
            </div>

            <div className="flex gap-2 mt-2 sm:mt-0 sm:col-span-1 justify-end w-full">
              <Button
                size="sm"
                onClick={onAddLocal}
                className="rounded-lg px-3 py-1"
                disabled={Boolean(Object.keys(newSpeakerErrors).length)}
              >
                Add
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  setNewSpeaker(null);
                  onFileChange?.("new", null);
                }}
                className="rounded-lg px-3 py-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </CardContent>
    </Card>
  );
}
