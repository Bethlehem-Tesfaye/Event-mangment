import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TicketRow from "./TicketRow";
import type { Ticket } from "../../types/organizer";

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
  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Tickets</CardTitle>
        {editable && !newTicket && <Button size="sm" onClick={() => setNewTicket({ type: "", price: "", totalQuantity: "", maxPerUser: "" })}>Add Ticket</Button>}
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {editable && (
          <div className="flex gap-2 font-semibold border-b p-2">
            <span className="w-1/4">Type</span>
            <span className="w-1/4">Price</span>
            <span className="w-1/4">Total Qty</span>
            <span className="w-1/4">Max/User</span>
            <span className="w-1/6"></span>
          </div>
        )}

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

        {newTicket && editable && (
          <div className="flex gap-2 items-center border p-2 rounded">
            <input className="w-1/4 input" placeholder="Type" value={newTicket.type} onChange={(e) => setNewTicket({ ...newTicket, type: e.target.value })} />
            <input className="w-1/4 input" placeholder="Price" type="number" value={newTicket.price} onChange={(e) => setNewTicket({ ...newTicket, price: e.target.value })} />
            <input className="w-1/4 input" placeholder="Total Quantity" type="number" value={newTicket.totalQuantity} onChange={(e) => setNewTicket({ ...newTicket, totalQuantity: e.target.value })} />
            <input className="w-1/4 input" placeholder="Max/User" type="number" value={newTicket.maxPerUser || ""} onChange={(e) => setNewTicket({ ...newTicket, maxPerUser: e.target.value })} />
            <Button size="sm" onClick={onAddLocal}>Add</Button>
            <Button size="sm" variant="destructive" onClick={() => setNewTicket(null)}>Cancel</Button>
          </div>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </CardContent>
    </Card>
  );
}