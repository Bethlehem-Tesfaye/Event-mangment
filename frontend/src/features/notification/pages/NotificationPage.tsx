import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useLogout } from "@/features/auth/hooks/useLogout";
import Sidebar from "@/features/organizer/Dashboard/components/SideBar";
import Topbar from "@/features/organizer/Dashboard/components/Topbar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../hooks/useNotification";

function NotificationPage() {
  const [route, setRoute] = useState<string>("dashboard");
  const { user } = useCurrentUser();
  const { mutate: logout } = useLogout();
  const navigate = useNavigate();
  const { data } = useNotification();
  const notifications = data ?? [];
  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        navigate("/");
      },
      onError: (err) => {
        console.error("Logout failed:", err);
      },
    });
  };
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#050505]  md:pl-56">
      <Sidebar active={route} onNavigate={setRoute} />
      <div className="flex-1 flex flex-col">
        <Topbar user={user} onLogout={handleLogout} />
        <main className="p-6 max-w-7xl w-full mx-auto flex-1">
          <h1>Notifications</h1>
          <ul>
            {notifications.length === 0 && <li>No notifications</li>}
            {notifications.map((notif: any) => (
              <li key={notif.id}>
                <strong>{notif.title}</strong>: {notif.message}{" "}
                {notif.read ? "(Read)" : "(Unread)"}
              </li>
            ))}
          </ul>
        </main>
      </div>
    </div>
  );
}

export default NotificationPage;
