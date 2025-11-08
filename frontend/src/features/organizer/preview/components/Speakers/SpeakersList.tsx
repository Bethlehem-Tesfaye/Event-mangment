import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SpeakerRow from "./SpeakerRow";
import type { Speaker } from "../../../types/organizer";

export default function SpeakersList({
  speakers,
  editable,
  newSpeaker,
  setNewSpeaker,
  onAddLocal,
  onChangeSpeaker,
  onRemoveLocal,
  onRemoteDelete,
  onFileChange, // added
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
  onFileChange?: (id: number | string | "new", file?: File | null) => void; // added
  error?: string | null;
}) {
  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Speakers</CardTitle>
        {editable && !newSpeaker && (
          <Button size="sm" onClick={() => setNewSpeaker({ name: "" })}>
            Add Speaker
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {speakers.map((s) => (
          <SpeakerRow
            key={s.id}
            speaker={s}
            editable={editable}
            onChange={onChangeSpeaker}
            onDelete={(id) => onRemoveLocal("speaker", id)}
            onRemoteDelete={onRemoteDelete}
            onFileChange={onFileChange} // added
          />
        ))}

        {newSpeaker && editable && (
          <div className="flex gap-2 items-center border p-2 rounded">
            <input
              className="w-1/4 input"
              placeholder="Name"
              value={newSpeaker.name}
              onChange={(e) =>
                setNewSpeaker({ ...newSpeaker, name: e.target.value })
              }
            />
            <input
              className="w-1/4 input"
              placeholder="Bio"
              value={newSpeaker.bio || ""}
              onChange={(e) =>
                setNewSpeaker({ ...newSpeaker, bio: e.target.value })
              }
            />

            {/* photo file input + preview */}
            <div className="w-1/4">
              <label className="block text-xs mb-1">Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setNewSpeaker({
                    ...newSpeaker,
                    photoFile: f,
                    photoPreview: f ? URL.createObjectURL(f) : undefined,
                  });
                  // notify parent for immediate state if needed
                  onFileChange?.("new", f);
                }}
              />
              {newSpeaker.photoPreview && (
                <img
                  src={newSpeaker.photoPreview}
                  alt="preview"
                  className="mt-2 h-16 w-16 object-cover rounded"
                />
              )}
            </div>

            <Button size="sm" onClick={onAddLocal}>
              Add
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                setNewSpeaker(null);
                onFileChange?.("new", null);
              }}
            >
              Cancel
            </Button>
          </div>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </CardContent>
    </Card>
  );
}
