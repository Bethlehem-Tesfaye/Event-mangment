import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Ticket as TicketType } from "../../../types/organizer";
import { PlusCircle, Edit2, Trash2, Ticket } from "lucide-react";
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
  tickets: TicketType[];
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
  const [formTouched, setFormTouched] = useState(false);

  // small helper to format price like the design
  const fmtCurrency = (v: any) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Number(v ?? 0));

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
    setFormTouched(false);
    setModalOpen(true);
  };

  const openEditModal = (t: TicketType) => {
    setNewTicket({
      id: t.id,
      type: t.type ?? "",
      price: t.price ?? "",
      totalQuantity: t.totalQuantity ?? "",
      maxPerUser: t.maxPerUser ?? "",
    });
    setEditingId(t.id);
    setFormTouched(false);
    setModalOpen(true);
  };

  const handleSaveFromModal = () => {
    setFormTouched(true);
    if (!newTicket) return;

    if (Object.keys(newTicketErrors).length > 0) {
      return;
    }

    if (editingId !== null && editingId !== undefined) {
      onChangeTicket(editingId, "type", newTicket.type);
      onChangeTicket(editingId, "price", newTicket.price);
      onChangeTicket(editingId, "totalQuantity", newTicket.totalQuantity);
      onChangeTicket(editingId, "maxPerUser", newTicket.maxPerUser);
      setEditingId(null);
      setNewTicket(null);
      setFormTouched(false);
      setModalOpen(false);
    } else {
      onAddLocal();
      setNewTicket(null);
      setFormTouched(false);
      setModalOpen(false);
    }
  };

  return (
    <Card className="shadow-none border dark:border-neutral-800 bg-transparent">
      <CardHeader className="flex items-start justify-between gap-4 p-6">
        <div>
          <CardTitle className="text-2xl">Tickets</CardTitle>
        </div>

        {editable && tickets.length > 0 && (
          <div className="ml-auto">
            <Button
              size="sm"
              onClick={openAddModal}
              className="inline-flex items-center gap-3 bg-[oklch(0.645_0.246_16.439)] hover:bg-red-600 text-white px-5 py-5 rounded-lg shadow-md"
            >
              <PlusCircle size={16} /> Add Ticket
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {editable && tickets.length === 0 && !newTicket && (
          <div className="w-full box-border p-6">
            <div className="w-full rounded-md p-6 border-2 border-dashed border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#0b0b0b]">
              <div className="flex flex-col items-center justify-center gap-6 w-full">
                <Ticket className="h-12 w-12 text-neutral-400 dark:text-neutral-300" />
                <p className="text-lg text-neutral-600 dark:text-neutral-300 text-center">
                  No tickets yet — create your first ticket
                </p>
                <Button
                  size="sm"
                  onClick={openAddModal}
                  className="inline-flex items-center gap-3 bg-[oklch(0.645_0.246_16.439)] hover:bg-red-600 text-white px-6 py-3 rounded-lg"
                >
                  <PlusCircle size={16} /> Add Ticket
                </Button>
              </div>
            </div>
          </div>
        )}

        {editable && (tickets.length > 0 || newTicket) && (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-neutral-600 dark:text-neutral-300 border-b">
                <tr>
                  <th className="text-left px-6 py-4">Type</th>
                  <th className="text-left px-6 py-4">Qty</th>
                  <th className="text-left px-6 py-4">Price</th>
                  <th className="text-left px-6 py-4">Max/User</th>
                  <th className="text-right px-6 py-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {tickets.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b last:border-b-0 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium">{t.type}</div>
                    </td>

                    <td className="px-6 py-2">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-sm">
                        {t.totalQuantity}
                      </span>
                    </td>

                    <td className="px-6 py-2">
                      <div className="text-base">{fmtCurrency(t.price)}</div>
                    </td>

                    <td className="px-6 py-2">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-sm">
                        {t.maxPerUser ?? "—"}
                      </span>
                    </td>

                    <td className="px-6 py-2 text-right">
                      <div className="inline-flex gap-2 items-center justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditModal(t)}
                          className="p-1 rounded"
                          aria-label="Edit ticket"
                        >
                          <Edit2
                            size={16}
                            className="text-neutral-500 hover:text-neutral-700"
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
                            className="text-neutral-500 hover:text-red-500"
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
          <div className="p-6">
            <div className="flex flex-col gap-3">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  className="grid grid-cols-5 gap-4 items-center py-3 border-b last:border-b-0"
                >
                  <div className="col-span-2 font-medium">{t.type}</div>
                  <div className="">{t.totalQuantity}</div>
                  <div className="">{fmtCurrency(t.price)}</div>
                  <div className="">{t.maxPerUser ?? "—"}</div>
                </div>
              ))}
            </div>
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
            <div className="relative bg-white dark:bg-neutral-900 rounded shadow-lg w-full max-w-xl p-8 z-10">
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
                        Ticket type — e.g. "General Admission", "VIP" (clear
                        label helps buyers)
                      </label>
                      <input
                        className="w-full px-3 py-2 rounded-md border dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
                        placeholder="e.g. General Admission"
                        value={newTicket.type}
                        onChange={(e) => {
                          setFormTouched(true);
                          setNewTicket({ ...newTicket, type: e.target.value });
                        }}
                      />
                      {formTouched && newTicketErrors.type && (
                        <p className="text-red-500 text-sm mt-1">
                          {newTicketErrors.type}
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-6 flex flex-col">
                      <label className="text-xs text-neutral-500 mb-1">
                        Price (USD) — amount attendees will pay for one ticket
                      </label>
                      <input
                        className="w-full px-3 py-2 rounded-md border dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
                        placeholder="0.00"
                        type="number"
                        value={newTicket.price}
                        onChange={(e) => {
                          setFormTouched(true);
                          setNewTicket({ ...newTicket, price: e.target.value });
                        }}
                      />
                      {formTouched && newTicketErrors.price && (
                        <p className="text-red-500 text-sm mt-1">
                          {newTicketErrors.price}
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-6 flex flex-col">
                      <label className="text-xs text-neutral-500 mb-1">
                        Total quantity — total number of tickets available for
                        this type
                      </label>
                      <input
                        className="w-full px-3 py-2 rounded-md border dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
                        placeholder="Total number of tickets (e.g. 100)"
                        type="number"
                        value={newTicket.totalQuantity}
                        onChange={(e) => {
                          setFormTouched(true);
                          setNewTicket({
                            ...newTicket,
                            totalQuantity: e.target.value,
                          });
                        }}
                      />
                      {formTouched && newTicketErrors.totalQuantity && (
                        <p className="text-red-500 text-sm mt-1">
                          {newTicketErrors.totalQuantity}
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-6 flex flex-col">
                      <label className="text-xs text-neutral-500 mb-1">
                        Max tickets per user — limit how many of this ticket one
                        buyer can purchase (leave blank for no limit)
                      </label>
                      <input
                        className="w-full px-3 py-2 rounded-md border dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
                        placeholder="e.g. 4 (leave empty for unlimited)"
                        type="number"
                        value={newTicket.maxPerUser || ""}
                        onChange={(e) => {
                          setFormTouched(true);
                          setNewTicket({
                            ...newTicket,
                            maxPerUser: e.target.value,
                          });
                        }}
                      />
                      {formTouched && newTicketErrors.maxPerUser && (
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
                  className="rounded px-4 py-1bg-[oklch(0.645_0.246_16.439)] hover:bg-red-600 text-white"
                >
                  {editingId ? "Save Ticket" : "Save Ticket"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {error && <p className="text-red-500 text-sm p-6">{error}</p>}
      </CardContent>
    </Card>
  );
}
