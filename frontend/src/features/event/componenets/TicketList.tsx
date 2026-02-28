import { useCallback, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Ticket } from "../types/event";
import PurchaseModal from "./PurchaseModal";
import { useCurrentUser } from "../../auth/hooks/useCurrentUser";
import { useLocation } from "react-router-dom";
import { useUserTicketStatus } from "../hooks/useUserTicketStatus";

interface TicketListProps {
  tickets: Ticket[];
  loading?: boolean;
  showCheckout?: boolean;
  eventId?: string | number;
}

export default function TicketList({
  tickets,
  loading,
  showCheckout = true,
  eventId,
}: TicketListProps) {
  const { user } = useCurrentUser();
  const location = useLocation();

  const { data: status } = useUserTicketStatus(eventId, !!user?.id);
  const ownedTicketIds = new Set<number | string>(status?.ticketIds ?? []);

  const showCheckoutEffective =
    showCheckout && !String(location.pathname).includes("/organizer");

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  if (loading) return <Skeleton className="w-full h-32" />;
  if (!tickets || tickets.length === 0) return null;

  const availableTicketsExist = tickets.some(
    (tt) => Number(tt.remainingQuantity) > 0,
  );

  const handleSelect = useCallback((ticket: Ticket) => {
    if (Number(ticket.remainingQuantity) === 0) return;
    setSelectedTicket((prev) => (prev?.id === ticket.id ? null : ticket));
  }, []);

  const handleCheckout = useCallback(() => {
    if (selectedTicket && Number(selectedTicket.remainingQuantity) > 0) {
      setModalOpen(true);
    }
  }, [selectedTicket]);

  const handleCloseModal = useCallback(() => setModalOpen(false), []);

  const handleModalPurchase = useCallback(() => {
    setModalOpen(false);
    setSelectedTicket(null);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border bg-white p-5 shadow-sm md:p-6">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-gray-900">
            Select tickets
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Choose one ticket type to continue
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {tickets.map((t) => (
            <div
              key={t.id}
              onClick={() => handleSelect(t)}
              className={`relative rounded-xl border p-4 transition ${
                selectedTicket?.id === t.id
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 bg-white hover:border-gray-300"
              } ${
                Number(t.remainingQuantity) === 0
                  ? "cursor-not-allowed opacity-80"
                  : "cursor-pointer"
              }`}
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  {t.type}
                </h3>
                <span
                  className={`h-4 w-4 rounded-full border shrink-0 mt-0.5 ${
                    selectedTicket?.id === t.id
                      ? "border-primary bg-primary"
                      : "border-gray-300 bg-white"
                  }`}
                />
              </div>

              {t.remainingQuantity === 0 ? (
                <span className="absolute top-3 right-3 rounded-full bg-red-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                  SOLD OUT
                </span>
              ) : (
                <span className="absolute top-3 right-3 rounded-full bg-gray-100 px-2 py-1 text-[10px] font-medium text-gray-600">
                  {t.remainingQuantity} left
                </span>
              )}

              {ownedTicketIds.has(t.id) && (
                <span className="absolute bottom-3 right-3 rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-semibold text-white">
                  Already bought
                </span>
              )}

              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-lg font-bold text-primary">
                  ${t.price}
                </span>
              </div>

              <ul className="mt-3 space-y-1 text-xs text-gray-600">
                <li>Max per user: {t.maxPerUser}</li>
                <li>Total tickets: {t.totalQuantity}</li>
              </ul>
            </div>
          ))}
        </div>
      </div>

      {showCheckoutEffective && availableTicketsExist && (
        <button
          className={`h-10 w-full rounded-md text-sm font-semibold transition ${
            selectedTicket && Number(selectedTicket.remainingQuantity) > 0
              ? "bg-primary text-white"
              : "bg-gray-300 text-gray-600 cursor-not-allowed"
          }`}
          disabled={
            !(selectedTicket && Number(selectedTicket.remainingQuantity) > 0)
          }
          onClick={handleCheckout}
        >
          Continue to Checkout
        </button>
      )}

      <PurchaseModal
        key={user?.id ?? "guest"}
        open={modalOpen}
        onClose={handleCloseModal}
        ticket={selectedTicket}
        onPurchase={handleModalPurchase}
      />
    </div>
  );
}
