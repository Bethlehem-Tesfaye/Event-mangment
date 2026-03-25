import { useEffect, useState } from "react";
import { Navbar } from "../../event/componenets/Navbar";
import { useTheme } from "next-themes";
import { LogOut, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useResendVerify } from "@/features/auth/hooks/useResendVerify";

import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

function Settings() {
  const { user, isPending } = useCurrentUser();

  const { mutate: logout, isPending: logoutLoading } = useLogout();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const resendMutation = useResendVerify();

  useEffect(() => setMounted(true), []);

  const handleLogout = () => {
    logout();
  };

  const handleResend = () => {
    if (!user) return;
    resendMutation.mutate({
      email: user.email,
      callbackURL: `${import.meta.env.VITE_CLIENT_URL}/browse-event`,
    });
  };

  const currentTheme = mounted ? theme ?? "light" : "light";

  if (isPending) {
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#202127]">
      <Navbar
        onLogout={handleLogout}
        logoutLoading={logoutLoading}
        showSearch={false}
        user={user as any}
      />

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        {/* General Section */}
        <section className="bg-white dark:bg-[#202127] border border-gray-200 dark:border-slate-700 rounded-2xl shadow-sm p-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            General
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
            Customize your app appearance.
          </p>

          <div className="flex items-center gap-3">
            <Sun
              className={`w-5 h-5 ${
                currentTheme === "light" ? "text-yellow-400" : "text-gray-400"
              }`}
            />

            <button
              onClick={() =>
                setTheme(currentTheme === "dark" ? "light" : "dark")
              }
              disabled={!mounted}
              role="switch"
              aria-checked={currentTheme === "dark"}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                currentTheme === "dark" ? "bg-red-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  currentTheme === "dark" ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>

            <Moon
              className={`w-5 h-5 ${
                currentTheme === "dark" ? "text-slate-300" : "text-gray-400"
              }`}
            />
          </div>
        </section>

        {/* Account Section */}
        <section className="bg-white dark:bg-[#202127] border border-gray-200 dark:border-slate-700 rounded-2xl shadow-sm p-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Account
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
            Manage your password and account security.
          </p>

          {user && !user.emailVerified && (
            <div className="mt-4">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Verify your email
              </h2>

              <Button
                onClick={handleResend}
                disabled={resendMutation.isPending}
                className="mt-2"
              >
                <Link to="/verify-notice">Verify Email</Link>
              </Button>
            </div>
          )}

          <div className="pt-5 border-t border-gray-100 dark:border-slate-700 flex justify-end">
            <button
              onClick={handleLogout}
              disabled={logoutLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              {logoutLoading ? "Logging out..." : "Logout"}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Settings;
