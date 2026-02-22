import { useLocation, useParams, Link } from "react-router-dom";
import { useUserRegistrations } from "../hooks/useUserRegistrations";
import { Skeleton } from "@/components/ui/skeleton";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { Navbar } from "../componenets/Navbar";

export default function RegistrationDetailsPage() {
  const { registrationId } = useParams();
  const { state } = useLocation() as { state?: { registration?: any } };

  // hooks MUST run unconditionally at top-level
  const { data: regs = [], isLoading } = useUserRegistrations();
  const { mutate: logout, isPending: logoutLoading } = useLogout();
  const { user } = useCurrentUser();

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

  const handleLogout = () => {
    logout(undefined, {
      onError: (err) => console.error("Logout failed:", err),
    });
  };

  const ev = registration.event;
  const ticket = registration.ticket;

  const startDate = ev?.startDatetime
    ? new Date(ev.startDatetime).toLocaleString()
    : "—";
  const endDate = ev?.endDatetime
    ? new Date(ev.endDatetime).toLocaleString()
    : "—";

  const qrValue =
    registration.qrCodeUrl ||
    registration.qrCode ||
    registration.qr_code ||
    null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50 dark:from-black dark:to-[#121212] text-black dark:text-white">
      <Navbar
        onLogout={handleLogout}
        logoutLoading={logoutLoading}
        showSearch={false}
        user={user as any}
      />

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* HEADER */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              Registration Details
            </p>
            <h1 className="text-3xl md:text-4xl font-bold mt-1">
              {ev?.title ?? "Untitled Event"}
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-2">
              Your ticket and event information, all in one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {ev?.id && (
              <Link
                to={`/events/${ev.id}`}
                className="px-4 py-2 rounded-lg bg-black text-white dark:bg-white dark:text-black text-sm font-medium transition hover:opacity-90"
              >
                View Event
              </Link>
            )}
          </div>
        </div>

        {/* CONTENT GRID */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* TICKET CARD */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-neutral-200 dark:border-[#202127] bg-white dark:bg-[#202127] shadow-sm p-6 relative overflow-hidden">
              <div className="absolute left-0 right-0 top-1/3 h-px bg-neutral-300 dark:bg-neutral-700 opacity-60"></div>

              <div className="pb-6">
                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                  Ticket Type
                </div>
                <div className="font-semibold text-xl">
                  {ticket?.type ?? "Ticket"}
                </div>
              </div>

              <div className="pt-6 space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">
                    Quantity
                  </span>
                  <span className="font-medium">
                    {registration.registeredQuantity ?? 1}
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
                    {registration.registeredAt
                      ? new Date(registration.registeredAt).toLocaleString()
                      : "—"}
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
          </div>

          {/* EVENT INFO */}
          <div className="rounded-2xl border border-neutral-200 dark:border-[#202127] bg-white dark:bg-[#202127] shadow-sm p-6">
            <div className="text-sm text-neutral-500 dark:text-neutral-400">
              Event Dates
            </div>
            <div className="mt-2 space-y-3 text-sm">
              <div className="flex flex-col">
                <span className="text-neutral-500 dark:text-neutral-400">
                  Start
                </span>
                <span className="font-medium">{startDate}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-neutral-500 dark:text-neutral-400">
                  End
                </span>
                <span className="font-medium">{endDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* QR CODE */}
        <div className="mt-8 rounded-2xl border border-neutral-200 dark:border-[#202127] bg-white dark:bg-[#202127] shadow-sm p-6">
          <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
            Entry QR Code
          </div>
          {qrValue ? (
            <div className="flex items-center justify-center">
              <img
                src={qrValue}
                alt="Registration QR Code"
                className="w-40 h-40 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white"
              />
            </div>
          ) : (
            <div className="text-sm text-neutral-500 dark:text-neutral-400">
              QR code not available for this registration.
            </div>
          )}
        </div>

        {/* BACK */}
        <div className="mt-8">
          <Link
            to="/user/myevents"
            className="text-sm px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:border-[oklch(0.645_0.246_16.439)] hover:text-[oklch(0.645_0.246_16.439)] transition-colors"
          >
            ← Back to registrations
          </Link>
        </div>
      </div>
    </div>
  );
}
