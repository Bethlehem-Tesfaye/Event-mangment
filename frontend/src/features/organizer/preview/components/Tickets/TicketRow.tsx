import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Ticket } from "../../../types/organizer";


export default function TicketRow({
  ticket,
  editable,
  onChange,
  onDelete,
  onRemoteDelete,
}: {
  ticket: Ticket;
  editable: boolean;
  onChange: (id: number | string, field: string, value: any) => void;
  onDelete: (id: number | string) => void;
  onRemoteDelete: (id: number) => void;
}) {
  return (
    <div className="flex gap-2 items-center border p-2 rounded">
      {editable ? (
        <>
          <Input className="w-1/4" value={String(ticket.type)} onChange={(e) => onChange(ticket.id, "type", e.target.value)} />
          <Input className="w-1/4" value={String(ticket.price)} type="number" onChange={(e) => onChange(ticket.id, "price", Number(e.target.value))} />
          <Input className="w-1/4" value={String(ticket.totalQuantity)} type="number" onChange={(e) => onChange(ticket.id, "totalQuantity", Number(e.target.value))} />
          <Input className="w-1/4" value={String(ticket.maxPerUser ?? "")} type="number" onChange={(e) => onChange(ticket.id, "maxPerUser", Number(e.target.value))} />
          {(ticket as any).isTemp ? (
            <Button variant="destructive" size="sm" onClick={() => onDelete(ticket.id)}>Delete</Button>
          ) : (
            <Button variant="destructive" size="sm" onClick={() => onRemoteDelete(Number(ticket.id))}>Delete</Button>
          )}
        </>
      ) : (
        <>
          <span className="w-1/4">{ticket.type}</span>
          <span className="w-1/4">${ticket.price}</span>
          <span className="w-1/4">Remaining: {ticket.remainingQuantity}</span>
          <span className="w-1/4">{ticket.maxPerUser ?? "-"}</span>
        </>
      )}
    </div>
  );
}