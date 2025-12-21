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
    onError: (error: any) => {
      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Purchase failed, please try again";
      toast.error(String(backendMessage));
      // eslint-disable-next-line no-console
      console.error("purchaseTicket error:", error);
    },
  });
};
