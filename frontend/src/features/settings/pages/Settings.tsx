import { useEffect, useState } from "react";
import { Navbar } from "../../event/componenets/Navbar";
import { useAuth } from "@/context/AuthContext";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useTheme } from "next-themes";
import { ChangePasswordForm } from "../components/ChangePasswordForm";
import { LogOut, Moon, Sun } from "lucide-react";
import { usePassword, useSetPassword } from "../hooks/usePassword";

function Settings() {
  const { user, clearAuth } = useAuth();
  const { mutate: logout, isPending: logoutLoading } = useLogout();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const passwordHook = usePassword();
  const setPasswordHook = useSetPassword();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => clearAuth(),
      onError: (err) => console.error("Logout failed:", err),
    });
  };

  const currentTheme = mounted ? theme ?? "light" : "light";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#202127]">
      <Navbar
        onLogout={handleLogout}
        logoutLoading={logoutLoading}
        showSearch={false}
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
            <select
              value={currentTheme}
              onChange={(e) => setTheme(e.target.value as "light" | "dark")}
              disabled={!mounted}
              className="rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-white px-3 py-2 focus:ring-2 focus:ring-red-400 outline-none transition-all"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>

            {currentTheme === "dark" ? (
              <Moon className="w-5 h-5 text-slate-300" />
            ) : (
              <Sun className="w-5 h-5 text-yellow-500" />
            )}
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

          <div className="mb-8">
            <ChangePasswordForm
              changePassword={
                user?.hasPassword
                  ? passwordHook.changePassword
                  : setPasswordHook.setPassword
              }
              user={user}
              isLoading={passwordHook.isLoading}
              hasPassword={user?.hasPassword}
            />
          </div>

          <div className="pt-5 border-t border-gray-100 dark:bg-[#202127] flex justify-end">
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
