// hooks/useChapaInitialize.ts
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

interface InitializePaymentInput {
  eventId: string;
  ticketId: string;
  quantity: number;
  attendeeName: string; // full name from UI
  attendeeEmail: string;
  phoneNumber?: string;
  returnUrl?: string;
}

interface InitializePaymentResponse {
  checkoutUrl: string;
  paymentId: string;
  expectedPayout: number;
  fees: number;
}

export const useChapaInitialize = () => {
  return useMutation<InitializePaymentResponse, any, InitializePaymentInput>({
    mutationFn: async (data: InitializePaymentInput) => {
      const apiBase = (import.meta as any).env?.VITE_AUTH_API_URL || "";
      const base = apiBase.replace(/\/$/, "");
      const url = base
        ? `${base}/api/chapa/initialize`
        : "/api/chapa/initialize";

      // split full name into first / last
      const nameParts = (data.attendeeName || "").trim().split(/\s+/);
      const firstName = nameParts.shift() || "";
      const lastName = nameParts.join(" ") || "";

      const payload = {
        eventId: data.eventId,
        ticketId: data.ticketId,
        quantity: data.quantity,
        firstName, // backend expects firstName
        lastName, // backend expects lastName
        email: data.attendeeEmail,
        phoneNumber: data.phoneNumber,
        returnUrl:
          data.returnUrl ?? `${window.location.origin}/payment-success`,
      };

      const token = localStorage.getItem("token");

      const response = await axios.post(url, payload, {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      return response.data;
    },
    onError: (error: any) => {
      console.error("Chapa initialization failed:", error);
      alert(error?.response?.data?.message || "Payment failed");
    },
  });
};
