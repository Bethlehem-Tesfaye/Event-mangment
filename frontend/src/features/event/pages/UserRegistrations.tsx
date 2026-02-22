import { Link } from "react-router-dom";
import { useUserRegistrations } from "../hooks/useUserRegistrations";
import { Skeleton } from "@/components/ui/skeleton";
import { Navbar } from "../componenets/Navbar";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useCurrentUser } from "../../auth/hooks/useCurrentUser";
import { useMemo, useState } from "react";

// add a simple Registration type (adjust fields to match your API shape)
type Registration = {
  id: string | number;
  event?: {
    id?: string | number;
    title?: string;
    startDatetime?: string; // <-- add this
  };
  ticket?: { type?: string; price?: number } | null;
  registeredQuantity?: number;
  registeredAt?: string;
  [k: string]: any;
};

type FilterKey = "all" | "upcoming" | "past";

export default function UserRegistrationsPage() {
  const { user } = useCurrentUser();
  const { data: regs, isLoading, error } = useUserRegistrations();
  const list = (regs ?? []) as Registration[];

  const { mutate: logout, isPending: logoutLoading } = useLogout();
  const [filter, setFilter] = useState<FilterKey>("all");

  const handleLogout = () => {
    logout(undefined, {
      onError: (err) => console.error("Logout failed:", err),
    });
  };

  const filteredList = useMemo(() => {
    if (filter === "all") return list;

    const now = new Date();
    return list.filter((r) => {
      const start = r.event?.startDatetime;
      if (!start) return false;
      const date = new Date(start);
      return filter === "upcoming" ? date >= now : date < now;
    });
  }, [list, filter]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50 dark:from-black dark:to-[#121212] text-black dark:text-white">
      <Navbar
        onLogout={handleLogout}
        logoutLoading={logoutLoading}
        showSearch={false}
        user={user as any}
      />

      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-4xl uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              My Tickets
            </p>

            <p className="text-neutral-600 dark:text-neutral-400 mt-2">
              Manage and review your event registrations in one place.
            </p>
          </div>

          <div className="inline-flex rounded-full border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-[#202127]/70 backdrop-blur px-1 py-1">
            {(["all", "upcoming", "past"] as FilterKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 text-sm rounded-full transition ${
                  filter === key
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                }`}
              >
                {key === "all"
                  ? "All"
                  : key === "upcoming"
                    ? "Upcoming"
                    : "Past"}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT */}
        <div className="mt-8">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#202127] shadow-sm"
                >
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/2 mt-3" />
                  <Skeleton className="h-3 w-1/3 mt-3" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-900">
              Failed to load registrations.
            </div>
          ) : !filteredList.length ? (
            <div className="p-8 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800 bg-white dark:bg-[#202127] text-neutral-600 dark:text-neutral-400">
              No registrations found for this filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredList.map((r) => (
                <Link
                  key={r.id}
                  to={`/registrations/${r.id}`}
                  state={{ registration: r }}
                  className="group block rounded-2xl border border-neutral-200 dark:border-[#202127] bg-white dark:bg-[#202127] p-5 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 no-underline"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xl font-semibold tracking-tight transition-colors group-hover:text-[oklch(0.645_0.246_16.439)]">
                        {r.event?.title ?? "Untitled event"}
                      </div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                        Ticket: {r.ticket?.type ?? "Ticket"}
                      </div>
                    </div>

                    <div className="text-xs px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                      Qty {r.registeredQuantity ?? 0}
                    </div>
                  </div>

                  <div className="h-px w-full my-4 bg-neutral-200 dark:bg-neutral-800" />

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500 dark:text-neutral-400">
                      Registered
                    </span>
                    <span className="font-medium">
                      {r.registeredAt
                        ? new Date(r.registeredAt).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )
                        : "—"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
