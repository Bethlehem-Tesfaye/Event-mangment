import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TicketRow from "./TicketRow";
import type { Ticket } from "../../../types/organizer";
import { PlusCircle } from "lucide-react";
import { useMemo } from "react";
import { createTicketSchema } from "@/schemas/ticket";

export default function TicketsList({
  tickets,
  editable,
  newTicket,
  setNewTicket,
  onAddLocal,
  onChangeTicket,
  onRemoveLocal,
  onRemoteDelete,
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
  // validate newTicket inline
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

  return (
    <Card className="shadow-none border dark:border-neutral-800">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-base">Tickets</CardTitle>
        {editable && !newTicket && (
          <Button
            size="sm"
            onClick={() =>
              setNewTicket({
                type: "",
                price: "",
                totalQuantity: "",
                maxPerUser: "",
              })
            }
            className="inline-flex items-center gap-2 rounded-lg px-3 py-1"
          >
            <PlusCircle size={14} /> Add Ticket
          </Button>
        )}
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {editable && (
          <div className="hidden sm:grid grid-cols-12 gap-2 font-semibold text-sm text-neutral-600 dark:text-neutral-300 border-b pb-2">
            <div className="col-span-3">Type</div>
            <div className="col-span-3">Price</div>
            <div className="col-span-2">Total Qty</div>
            <div className="col-span-2">Max/User</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {tickets.map((t) => (
            <TicketRow
              key={t.id}
              ticket={t}
              editable={editable}
              onChange={onChangeTicket}
              onDelete={(id) => onRemoveLocal("ticket", id)}
              onRemoteDelete={onRemoteDelete}
            />
          ))}
        </div>

        {newTicket && editable && (
          <div className="flex flex-col gap-3 border rounded-lg p-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <div className="sm:col-span-3 flex flex-col">
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

              <div className="sm:col-span-3 flex flex-col">
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

              <div className="sm:col-span-2 flex flex-col">
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

              <div className="sm:col-span-2 flex flex-col">
                <input
                  className="w-full px-3 py-2 rounded-md border dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
                  placeholder="Max/User"
                  type="number"
                  value={newTicket.maxPerUser || ""}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, maxPerUser: e.target.value })
                  }
                />
                {newTicketErrors.maxPerUser && (
                  <p className="text-red-500 text-sm mt-1">
                    {newTicketErrors.maxPerUser}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                size="sm"
                onClick={onAddLocal}
                disabled={Boolean(Object.keys(newTicketErrors).length)}
                className="rounded-lg px-3 py-1"
              >
                Add
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setNewTicket(null)}
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
