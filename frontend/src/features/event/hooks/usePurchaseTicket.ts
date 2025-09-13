import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { purchaseTicket as apiPurchaseTicket } from "../api/eventsApi";

type PurchasePayload = {
  eventId: number | string;
  ticketId: number | string;
  attendeeName: string;
  attendeeEmail: string;
  quantity: number;
};

export const usePurchaseTicket = () => {
  return useMutation<any, unknown, PurchasePayload, unknown>({
    mutationFn: (payload: PurchasePayload) => apiPurchaseTicket(payload),
    onSuccess: () => {
      toast.success("Ticket purchased — check your email for the QR code!");
    },
    onError: (err: unknown) => {
      const serverMsg =
        (err && typeof err === "object" && "response" in err && (err as any).response?.data?.message) ||
        (err && typeof err === "object" && (err as any).message) ||
        "Purchase failed";
      toast.error(String(serverMsg));
    },
  });
};
