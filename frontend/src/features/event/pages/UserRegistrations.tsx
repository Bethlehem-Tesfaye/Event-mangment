import { Link } from "react-router-dom";
import { useUserRegistrations } from "../hooks/useUserRegistrations";
import { Skeleton } from "@/components/ui/skeleton";
import { Navbar } from "../componenets/Navbar";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useAuth } from "@/context/AuthContext";

export default function UserRegistrationsPage() {
  const { data: regs, isLoading, error } = useUserRegistrations();
  const list = regs ?? [];
  const { mutate: logout, isPending: logoutLoading } = useLogout();
  const { clearAuth } = useAuth();

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => clearAuth(),
      onError: (err) => console.error("Logout failed:", err),
    });
  };

  return (
    <div>
      <Navbar
        onLogout={handleLogout}
        logoutLoading={logoutLoading}
        showSearch={false}
      />

      {isLoading ? (
        <div className="space-y-3 p-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 bg-white dark:bg-slate-800 rounded-lg">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-1/4 mt-2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-4 text-red-500">Failed to load registrations.</div>
      ) : !list.length ? (
        <div className="p-6 text-muted-foreground">
          You have no registrations yet.
        </div>
      ) : (
        <div className="p-6 space-y-4">
          {list.map((r: any) => (
            <div
              key={r.id}
              className="border rounded-lg p-4 bg-white dark:bg-slate-800 flex items-center justify-between"
            >
              <div>
                <Link
                  to={`/events/${r.eventId}`}
                  className="font-semibold text-lg"
                >
                  {r.event?.title ?? "Untitled event"}
                </Link>
                <div className="text-sm text-muted-foreground">
                  {r.ticket?.type ?? "Ticket"} • Qty: {r.registeredQuantity} •{" "}
                  {new Date(r.registeredAt).toLocaleString()}
                </div>
              </div>

              <div className="flex flex-col items-end">
                <Link to={`/events/${r.eventId}`} className="text-sm underline">
                  View event
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
