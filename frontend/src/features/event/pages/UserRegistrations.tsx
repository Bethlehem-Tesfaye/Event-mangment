import { Link } from "react-router-dom";
import { useUserRegistrations } from "../hooks/useUserRegistrations";
import { Skeleton } from "@/components/ui/skeleton";
import { Navbar } from "../componenets/Navbar";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useCurrentUser } from "../../auth/hooks/useCurrentUser";

// add a simple Registration type (adjust fields to match your API shape)
type Registration = {
  id: string | number;
  event?: { id?: string | number; title?: string };
  ticket?: { type?: string; price?: number } | null;
  registeredQuantity?: number;
  registeredAt?: string;
  [k: string]: any;
};

export default function UserRegistrationsPage() {
  const { user } = useCurrentUser();
  const { data: regs, isLoading, error } = useUserRegistrations();
  const list = (regs ?? []) as Registration[];

  const { mutate: logout, isPending: logoutLoading } = useLogout();

  const handleLogout = () => {
    logout(undefined, {
      onError: (err) => console.error("Logout failed:", err),
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <Navbar
        onLogout={handleLogout}
        logoutLoading={logoutLoading}
        showSearch={false}
        user={user as any}
      />

      {/* LOADING */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900"
            >
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-1/3 mt-3" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-6 text-red-500">Failed to load registrations.</div>
      ) : !list.length ? (
        <div className="p-6 text-neutral-500">
          You have no registrations yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {list.map((r) => (
            <Link
              key={r.id}
              to={`/registrations/${r.id}`}
              state={{ registration: r }}
              className="group block rounded-2xl border border-neutral-200 dark:border-[#202127] bg-neutral-50 dark:bg-[#202127] p-5 transition-shadow shadow-sm hover:shadow-[0_0_15px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] no-underline"
            >
              <div className="flex flex-col">
                {/* TITLE */}
                <div className="text-xl font-semibold tracking-tight mb-2 transition-colors group-hover:text-[oklch(0.645_0.246_16.439)]">
                  {r.event?.title ?? "Untitled event"}
                </div>

                {/* DIVIDER */}
                <div className="h-px w-full my-3 bg-neutral-300 dark:bg-[#202127]"></div>

                {/* DETAILS */}
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500 dark:text-neutral-400">
                      Ticket
                    </span>
                    <span className="font-medium">
                      {r.ticket?.type ?? "Ticket"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-neutral-500 dark:text-neutral-400">
                      Qty
                    </span>
                    <span className="font-medium">{r.registeredQuantity}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-neutral-500 dark:text-neutral-400">
                      Date
                    </span>
                    <span className="font-medium">
                      {r.registeredAt
                        ? new Date(r.registeredAt).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
