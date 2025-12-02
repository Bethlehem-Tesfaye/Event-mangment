import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Speaker } from "../../../types/organizer";
import { PlusCircle, Camera, Edit2, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { createSpeakerSchema } from "@/schemas/speaker";

export default function SpeakersList({
  speakers,
  editable,
  newSpeaker,
  setNewSpeaker,
  onAddLocal,
  onChangeSpeaker,
  onRemoveLocal,
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

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);

  const openAddModal = () => {
    setNewSpeaker({
      name: "",
      bio: "",
      photoFile: null,
      photoPreview: undefined,
      photoUrl: undefined,
    });
    setEditingId(null);
    setModalOpen(true);
  };

  const openEditModal = (s: Speaker) => {
    setNewSpeaker({
      id: s.id,
      name: s.name ?? "",
      bio: s.bio ?? "",
      photoFile: (s as any).photoFile ?? null,
      photoPreview: (s as any).photoPreview ?? undefined,
      photoUrl: s.photoUrl ?? undefined,
    });
    setEditingId(s.id);
    setModalOpen(true);
  };

  const handleSaveFromModal = () => {
    if (!newSpeaker) return;

    if (editingId !== null && editingId !== undefined) {
      // update existing speaker fields via onChangeSpeaker
      onChangeSpeaker(editingId, "name", newSpeaker.name);
      onChangeSpeaker(editingId, "bio", newSpeaker.bio);

      // if a new file selected, notify parent
      if (newSpeaker.photoFile) {
        onFileChange?.(editingId, newSpeaker.photoFile);
        onChangeSpeaker(editingId, "photoFile", newSpeaker.photoFile);
        onChangeSpeaker(editingId, "photoPreview", newSpeaker.photoPreview);
      }
    } else {
      // add new speaker (local)
      onAddLocal();
    }

    setEditingId(null);
    setNewSpeaker(null);
    setModalOpen(false);
  };

  return (
    <Card className="shadow-none border dark:border-neutral-800">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-base">Speakers</CardTitle>
        {editable && !newSpeaker && (
          <Button
            size="sm"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-1"
          >
            <PlusCircle size={14} /> Add Speaker
          </Button>
        )}
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {editable && (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="hidden sm:table-row text-neutral-600 dark:text-neutral-300">
                  <th className="text-left px-3 py-2 w-1/3">Name</th>
                  <th className="text-left px-3 py-2 w-1/2">Bio</th>
                  <th className="text-left px-3 py-2 w-1/6">Photo</th>
                  <th className="text-right px-3 py-2 w-1/6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {speakers.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b last:border-b-0 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                  >
                    <td className="px-3 py-3 align-top">
                      <div className="sm:hidden font-semibold">Name</div>
                      <div>{s.name}</div>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <div className="sm:hidden font-semibold">Bio</div>
                      <div className="truncate">{s.bio ?? "—"}</div>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <div className="sm:hidden font-semibold">Photo</div>
                      {(s as any).photoPreview ?? s.photoUrl ? (
                        <img
                          src={(s as any).photoPreview ?? s.photoUrl ?? ""}
                          alt={s.name ?? "speaker"}
                          className="h-10 w-10 rounded-full object-cover border"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-sm text-neutral-500 border">
                          {initials(s.name)}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right align-top">
                      <div className="inline-flex gap-2 items-center justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditModal(s)}
                          className="p-1 rounded"
                          aria-label="Edit speaker"
                        >
                          <Edit2
                            size={16}
                            className="text-neutral-400 hover:text-neutral-600"
                          />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onRemoveLocal("speaker", s.id)}
                          className="p-1 rounded"
                          aria-label="Delete speaker"
                        >
                          <Trash2
                            size={16}
                            className="text-neutral-400 hover:text-red-500"
                          />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!editable && (
          <div className="flex flex-col gap-2">
            {speakers.map((s) => (
              <div
                key={s.id}
                className="grid grid-cols-12 gap-2 items-center py-2"
              >
                <div className="col-span-5">{s.name}</div>
                <div className="col-span-5">{s.bio ?? "—"}</div>
                <div className="col-span-1">
                  {(s as any).photoPreview ?? s.photoUrl ? (
                    <img
                      src={(s as any).photoPreview ?? s.photoUrl ?? ""}
                      alt={s.name ?? "speaker"}
                      className="h-10 w-10 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-sm text-neutral-500 border">
                      {initials(s.name)}
                    </div>
                  )}
                </div>
                <div className="col-span-1 text-right"></div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for add/edit speaker */}
        {modalOpen && newSpeaker && editable && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => {
                setNewSpeaker(null);
                setModalOpen(false);
                setEditingId(null);
              }}
            />
            <div className="relative bg-white dark:bg-neutral-900 rounded shadow-lg w-full max-w-lg p-6 z-10">
              <button
                aria-label="Close"
                className="absolute top-3 right-3 text-sm text-neutral-500 hover:text-neutral-700"
                onClick={() => {
                  setNewSpeaker(null);
                  setModalOpen(false);
                  setEditingId(null);
                }}
              >
                ✕
              </button>

              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1 dark:text-white">
                    {editingId ? "Edit Speaker" : "Add Speaker"}
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                    Provide speaker details below.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-6 flex flex-col">
                      <label className="text-xs text-neutral-500 mb-1">
                        Name
                      </label>
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

                    <div className="sm:col-span-6 flex flex-col">
                      <label className="text-xs text-neutral-500 mb-1">
                        Bio
                      </label>
                      <input
                        className="w-full px-3 py-2 rounded-md border dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
                        placeholder="Bio"
                        value={newSpeaker.bio || ""}
                        onChange={(e) =>
                          setNewSpeaker({ ...newSpeaker, bio: e.target.value })
                        }
                      />
                    </div>

                    <div className="sm:col-span-6 flex flex-col items-start">
                      <label className="text-xs text-neutral-500 mb-1">
                        Photo
                      </label>
                      <label className="relative inline-flex items-center gap-2 cursor-pointer group">
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => {
                            const f = e.target.files?.[0] ?? null;
                            const preview = f
                              ? URL.createObjectURL(f)
                              : undefined;
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
                              className="h-12 w-12 rounded-full object-cover border"
                            />
                          ) : newSpeaker.photoUrl ? (
                            <img
                              src={newSpeaker.photoUrl}
                              alt="preview"
                              className="h-12 w-12 rounded-full object-cover border"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-sm font-medium text-neutral-600 border">
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
                      {newSpeakerErrors.photoUrl && (
                        <p className="text-red-500 text-sm mt-1">
                          {newSpeakerErrors.photoUrl}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="hidden sm:block relative">
                  <div className="absolute top-4 right-[-18px] h-[calc(100%-32px)] border-r-2 border-dashed border-red-300" />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setNewSpeaker(null);
                    setModalOpen(false);
                    setEditingId(null);
                  }}
                  className="rounded px-4 py-1"
                >
                  Cancel
                </Button>

                <Button
                  size="sm"
                  onClick={handleSaveFromModal}
                  disabled={Boolean(Object.keys(newSpeakerErrors).length)}
                  className="rounded px-4 py-1 bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {editingId ? "Save" : "Add Speaker"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </CardContent>
    </Card>
  );
}
