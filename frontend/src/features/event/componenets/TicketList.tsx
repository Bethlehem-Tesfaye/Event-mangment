import { useCallback, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Ticket } from "../types/event";
import PurchaseModal from "./PurchaseModal";
import { useAuth } from "@/context/AuthContext";

interface TicketListProps {
  tickets: Ticket[];
  loading?: boolean;
}

export default function TicketList({ tickets, loading }: TicketListProps) {
  const { user } = useAuth();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  if (loading) return <Skeleton className="w-full h-32" />;
  if (!tickets || tickets.length === 0) return null;

  const handleSelect = useCallback((ticket: Ticket) => {
    setSelectedTicket((prev) => (prev?.id === ticket.id ? null : ticket));
  }, []);

  const handleCheckout = useCallback(() => {
    if (selectedTicket) setModalOpen(true);
  }, [selectedTicket]);

  const handleCloseModal = useCallback(() => setModalOpen(false), []);

  const handleModalPurchase = useCallback(() => {
    setModalOpen(false);
    setSelectedTicket(null);
  }, []);

  return (
    <div className="flex flex-col gap-4 ">
      <div className="border rounded-2xl p-6 bg-gray-50 dark:bg-[#202127]">
        <h2 className="text-md mb-2">Select Tickets</h2>
        <div className="flex flex-col gap-3 ">
          {tickets.map((t) => (
            <div
              key={t.id}
              onClick={() => handleSelect(t)}
              className={`relative border rounded-xl p-5 bg-white shadow-sm cursor-pointer transition dark:bg-gray-500 ${
                selectedTicket?.id === t.id
                  ? "border-red-500 ring-2 ring-red-200"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span className="absolute top-3 right-3 bg-red-200 text-gray-800 text-xs font-medium px-2 py-1 rounded-full dark:text-gray-300 dark:bg-red-500">
                {t.remainingQuantity} left
              </span>
              <h3 className="text-md">{t.type}</h3>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-lg font-bold text-red-800 dark:text-gray-300 ">
                  ${t.price}
                </span>
              </div>
              <ul className="list-disc list-inside text-[12px] text-gray-600 mt-3 space-y-1 dark:text-gray-300 ">
                <li>Max per user: {t.maxPerUser}</li>
                <li>Total tickets: {t.totalQuantity}</li>
              </ul>
            </div>
          ))}
        </div>
      </div>

      <button
        className={`mt-4 w-full py-2 rounded-md font-semibold transition text-[12px] ${
          selectedTicket
            ? "bg-red-500 text-white border border-red-700"
            : "bg-gray-300 text-gray-600 cursor-not-allowed"
        }`}
        disabled={!selectedTicket}
        onClick={handleCheckout}
      >
        Continue to Checkout
      </button>

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
