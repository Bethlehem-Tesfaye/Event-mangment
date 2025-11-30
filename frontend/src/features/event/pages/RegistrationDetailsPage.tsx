import { useLocation, useParams, Link } from "react-router-dom";
import { useUserRegistrations } from "../hooks/useUserRegistrations";
import { Skeleton } from "@/components/ui/skeleton";

export default function RegistrationDetailsPage() {
  const { registrationId } = useParams();
  const { state } = useLocation() as { state?: { registration?: any } };
  const { data: regs = [], isLoading } = useUserRegistrations();

  const registration =
    state?.registration ||
    regs.find((r: any) => String(r.id) === String(registrationId));

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Skeleton className="h-7 w-1/3 mb-4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="p-6 text-neutral-500 dark:text-neutral-400">
        Registration not found.
      </div>
    );
  }

  const ev = registration.event;
  const ticket = registration.ticket;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight mb-1">
          {ev?.title ?? "Untitled Event"}
        </h1>

        {ev?.id && (
          <Link
            to={`/events/${ev.id}`}
            className="
              text-sm underline underline-offset-4
              text-neutral-700 dark:text-neutral-300
              hover:text-[oklch(0.645_0.246_16.439)]
              transition-colors
            "
          >
            View event details →
          </Link>
        )}
      </div>

      {/* TICKET */}
      <div
        className="
          rounded-2xl border border-neutral-200 dark:border-[#202127]
          bg-white dark:bg-[#202127]
          shadow-sm p-6 relative
          overflow-hidden
        "
      >
        {/* Decorative perforation line */}
        <div className="absolute left-0 right-0 top-1/3 h-px bg-neutral-300 dark:bg-neutral-700 opacity-60"></div>

        {/* Top section */}
        <div className="pb-6">
          <div className="text-sm text-neutral-500 dark:text-neutral-400">
            Ticket Type
          </div>
          <div className="font-medium text-lg">{ticket?.type ?? "Ticket"}</div>
        </div>

        {/* Bottom section */}
        <div className="pt-6 space-y-4">
          <div className="flex justify-between">
            <span className="text-neutral-500 dark:text-neutral-400">
              Quantity
            </span>
            <span className="font-medium">
              {registration.registeredQuantity}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-neutral-500 dark:text-neutral-400">
              Price
            </span>
            <span className="font-medium">
              {ticket?.price != null ? `$${ticket.price}` : "N/A"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-neutral-500 dark:text-neutral-400">
              Registered At
            </span>
            <span className="font-medium">
              {new Date(registration.registeredAt).toLocaleString()}
            </span>
          </div>

          {registration.seat && (
            <div className="flex justify-between">
              <span className="text-neutral-500 dark:text-neutral-400">
                Seat
              </span>
              <span className="font-medium">{registration.seat}</span>
            </div>
          )}
        </div>
      </div>

      {/* BACK BUTTON */}
      <div className="mt-8">
        <Link
          to="/user/myevents"
          className="
            text-sm px-4 py-2 rounded-lg border
            border-neutral-300 dark:border-neutral-700
            hover:border-[oklch(0.645_0.246_16.439)]
            hover:text-[oklch(0.645_0.246_16.439)]
            transition-colors
          "
        >
          ← Back to registrations
        </Link>
      </div>
    </div>
  );
}
