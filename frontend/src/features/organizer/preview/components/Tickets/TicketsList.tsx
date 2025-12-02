import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Ticket } from "../../../types/organizer";
import { PlusCircle, Edit2, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { createTicketSchema } from "@/schemas/ticket";

export default function TicketsList({
  tickets,
  editable,
  newTicket,
  setNewTicket,
  onAddLocal,
  onChangeTicket,
  onRemoveLocal,
  error,
}: {
  tickets: Ticket[];
  editable: boolean;
  newTicket: any;
  setNewTicket: (v: any) => void;
  onAddLocal: () => void;
  onChangeTicket: (id: number | string, field: string, value: any) => void;
  onRemoveLocal: (type: "ticket" | "speaker", id: string | number) => void;
  onRemoteDelete: (id: number) => void;
  error?: string | null;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);

  const newTicketErrors = useMemo(() => {
    if (!newTicket) return {};
    const parsed = createTicketSchema.safeParse({
      type: String(newTicket.type ?? ""),
      price: Number(newTicket.price ?? ""),
      totalQuantity: Number(newTicket.totalQuantity ?? ""),
      maxPerUser:
        newTicket.maxPerUser === "" ||
        newTicket.maxPerUser === null ||
        newTicket.maxPerUser === undefined
          ? undefined
          : Number(newTicket.maxPerUser),
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
  }, [newTicket]);

  const openAddModal = () => {
    setNewTicket({
      type: "",
      price: "",
      totalQuantity: "",
      maxPerUser: "",
    });
    setEditingId(null);
    setModalOpen(true);
  };

  const openEditModal = (t: Ticket) => {
    setNewTicket({
      id: t.id,
      type: t.type ?? "",
      price: t.price ?? "",
      totalQuantity: t.totalQuantity ?? "",
      maxPerUser: t.maxPerUser ?? "",
    });
    setEditingId(t.id);
    setModalOpen(true);
  };

  const handleSaveFromModal = () => {
    if (!newTicket) return;
    if (editingId !== null && editingId !== undefined) {
      onChangeTicket(editingId, "type", newTicket.type);
      onChangeTicket(editingId, "price", newTicket.price);
      onChangeTicket(editingId, "totalQuantity", newTicket.totalQuantity);
      onChangeTicket(editingId, "maxPerUser", newTicket.maxPerUser);
      setEditingId(null);
      setNewTicket(null);
      setModalOpen(false);
    } else {
      onAddLocal();
      setNewTicket(null);
      setModalOpen(false);
    }
  };

  return (
    <Card className="shadow-none border dark:border-neutral-800">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-base">Tickets</CardTitle>
        {editable && !newTicket && (
          <Button
            size="sm"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-1"
          >
            <PlusCircle size={14} /> Add Ticket
          </Button>
        )}
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {editable && (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="hidden sm:table-row text-neutral-600 dark:text-neutral-300">
                  <th className="text-left px-3 py-2 w-1/3">Type</th>
                  <th className="text-left px-3 py-2 w-1/6">Qty</th>
                  <th className="text-left px-3 py-2 w-1/6">Price</th>
                  <th className="text-left px-3 py-2 w-1/6">Max/User</th>
                  <th className="text-right px-3 py-2 w-1/6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b last:border-b-0 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                  >
                    <td className="px-3 py-3">{t.type}</td>
                    <td className="px-3 py-3">{t.totalQuantity}</td>
                    <td className="px-3 py-3">{t.price}</td>
                    <td className="px-3 py-3">{t.maxPerUser ?? "—"}</td>
                    <td className="px-3 py-3 text-right">
                      <div className="inline-flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditModal(t)}
                          className="p-1 rounded"
                          aria-label="Edit ticket"
                        >
                          <Edit2
                            size={16}
                            className="text-neutral-400 hover:text-neutral-600"
                          />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onRemoveLocal("ticket", t.id)}
                          className="p-1 rounded"
                          aria-label="Delete ticket"
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
            {tickets.map((t) => (
              <div
                key={t.id}
                className="grid grid-cols-5 gap-2 items-center py-2"
              >
                <div className="col-span-2">{t.type}</div>
                <div className="">{t.totalQuantity}</div>
                <div className="">{t.price}</div>
                <div className="">{t.maxPerUser ?? "—"}</div>
                <div className="text-right"></div>
              </div>
            ))}
          </div>
        )}

        {modalOpen && newTicket && editable && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => {
                setNewTicket(null);
                setModalOpen(false);
                setEditingId(null);
              }}
            />
            <div className="relative bg-white dark:bg-neutral-900 rounded shadow-lg w-full max-w-md p-6 z-10">
              <button
                aria-label="Close"
                className="absolute top-3 right-3 text-sm text-neutral-500 hover:text-neutral-700"
                onClick={() => {
                  setNewTicket(null);
                  setModalOpen(false);
                  setEditingId(null);
                }}
              >
                ✕
              </button>

              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1 dark:text-white">
                    {editingId ? "Edit Ticket" : "Add Ticket"}
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                    Create a new ticket type for your event. Fill in the details
                    below.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-6 flex flex-col">
                      <label className="text-xs text-neutral-500 mb-1">
                        Type
                      </label>
                      <input
                        className="w-full px-3 py-2 rounded-md border dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
                        placeholder="Type"
                        value={newTicket.type}
                        onChange={(e) =>
                          setNewTicket({ ...newTicket, type: e.target.value })
                        }
                      />
                      {newTicketErrors.type && (
                        <p className="text-red-500 text-sm mt-1">
                          {newTicketErrors.type}
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-6 flex flex-col">
                      <label className="text-xs text-neutral-500 mb-1">
                        Price
                      </label>
                      <input
                        className="w-full px-3 py-2 rounded-md border dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
                        placeholder="Price"
                        type="number"
                        value={newTicket.price}
                        onChange={(e) =>
                          setNewTicket({ ...newTicket, price: e.target.value })
                        }
                      />
                      {newTicketErrors.price && (
                        <p className="text-red-500 text-sm mt-1">
                          {newTicketErrors.price}
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-6 flex flex-col">
                      <label className="text-xs text-neutral-500 mb-1">
                        Quantity
                      </label>
                      <input
                        className="w-full px-3 py-2 rounded-md border dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
                        placeholder="Total Qty"
                        type="number"
                        value={newTicket.totalQuantity}
                        onChange={(e) =>
                          setNewTicket({
                            ...newTicket,
                            totalQuantity: e.target.value,
                          })
                        }
                      />
                      {newTicketErrors.totalQuantity && (
                        <p className="text-red-500 text-sm mt-1">
                          {newTicketErrors.totalQuantity}
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-6 flex flex-col">
                      <label className="text-xs text-neutral-500 mb-1">
                        Max per User
                      </label>
                      <input
                        className="w-full px-3 py-2 rounded-md border dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
                        placeholder="Max/User"
                        type="number"
                        value={newTicket.maxPerUser || ""}
                        onChange={(e) =>
                          setNewTicket({
                            ...newTicket,
                            maxPerUser: e.target.value,
                          })
                        }
                      />
                      {newTicketErrors.maxPerUser && (
                        <p className="text-red-500 text-sm mt-1">
                          {newTicketErrors.maxPerUser}
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
                    setNewTicket(null);
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
                  disabled={Boolean(Object.keys(newTicketErrors).length)}
                  className="rounded px-4 py-1 bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {editingId ? "Save Ticket" : "Save Ticket"}
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
