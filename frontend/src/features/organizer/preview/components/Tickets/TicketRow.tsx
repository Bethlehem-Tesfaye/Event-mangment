import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { Ticket } from "../../../types/organizer";
import { useEffect, useState } from "react";
import { createTicketSchema } from "@/schemas/ticket";

export default function TicketRow({
  ticket,
  editable,
  onChange,
  onDelete,
}: {
  ticket: Ticket;
  editable: boolean;
  onChange: (id: number | string, field: string, value: any) => void;
  onDelete: (id: number | string) => void;
  onRemoteDelete?: (id: number) => void;
}) {
  const handleDelete = () => {
    const id = ticket.id as any;
    onDelete(id);
  };

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const parsed = createTicketSchema.safeParse({
      type: ticket.type ?? "",
      price: Number(ticket.price ?? ""),
      totalQuantity: Number(ticket.totalQuantity ?? ""),
      maxPerUser:
        ticket.maxPerUser === null || ticket.maxPerUser === undefined
          ? undefined
          : Number(ticket.maxPerUser),
    });

    if (!parsed.success) {
      const map: Record<string, string> = {};
      parsed.error.issues.forEach((iss) => {
        const p = iss.path?.[0];
        if (typeof p === "string") {
          if (!map[p]) map[p] = iss.message;
        } else {
          map["_"] = (map["_"] ? map["_"] + " • " : "") + iss.message;
        }
      });
      setErrors(map);
    } else {
      setErrors({});
    }
  }, [ticket]);

  return (
    <div className="grid grid-cols-12 gap-2 items-start py-2">
      <div className="col-span-3">
        {editable ? (
          <>
            <Input
              className="w-full px-2 py-1 rounded border"
              value={ticket.type ?? ""}
              onChange={(e) => onChange(ticket.id, "type", e.target.value)}
            />
            {errors.type && (
              <p className="text-red-500 text-sm mt-1">{errors.type}</p>
            )}
          </>
        ) : (
          <span>{ticket.type}</span>
        )}
      </div>

      <div className="col-span-3">
        {editable ? (
          <>
            <Input
              className="w-full px-2 py-1 rounded border"
              type="number"
              value={String(ticket.price ?? "")}
              onChange={(e) => onChange(ticket.id, "price", e.target.value)}
            />
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">{errors.price}</p>
            )}
          </>
        ) : (
          <span>{ticket.price}</span>
        )}
      </div>

      <div className="col-span-2">
        {editable ? (
          <>
            <Input
              className="w-full px-2 py-1 rounded border"
              type="number"
              value={String(ticket.totalQuantity ?? "")}
              onChange={(e) =>
                onChange(ticket.id, "totalQuantity", e.target.value)
              }
            />
            {errors.totalQuantity && (
              <p className="text-red-500 text-sm mt-1">
                {errors.totalQuantity}
              </p>
            )}
          </>
        ) : (
          <span>{ticket.totalQuantity}</span>
        )}
      </div>

      <div className="col-span-2">
        {editable ? (
          <>
            <Input
              className="w-full px-2 py-1 rounded border"
              type="number"
              value={String(ticket.maxPerUser ?? "")}
              onChange={(e) =>
                onChange(ticket.id, "maxPerUser", e.target.value)
              }
            />
            {errors.maxPerUser && (
              <p className="text-red-500 text-sm mt-1">{errors.maxPerUser}</p>
            )}
          </>
        ) : (
          <span>{ticket.maxPerUser ?? "—"}</span>
        )}
      </div>

      <div className="col-span-2 text-right flex justify-end gap-2">
        {editable && (
          <>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDelete}
              title="Delete"
            >
              <Trash2 size={16} />
            </Button>
          </>
        )}
        {errors._ && (
          <p className="text-red-500 text-sm mt-1 col-span-12">{errors._}</p>
        )}
      </div>
    </div>
  );
}
