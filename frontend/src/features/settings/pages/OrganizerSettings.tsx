import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { LogOut, Moon, Sun } from "lucide-react";
import Sidebar from "@/features/organizer/Dashboard/components/SideBar";
import Topbar from "@/features/organizer/Dashboard/components/Topbar";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useCurrentUser } from "../../auth/hooks/useCurrentUser";
import {
  useOrganizerSettings,
  useGetOrganizerChapaKey,
  useEditOrganizerChapaKey,
} from "../hooks/useOrganizerSettings";

export default function Settings() {
  const { user } = useCurrentUser();
  const { mutate: logout, isPending: logoutLoading } = useLogout();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [route, setRoute] = useState<string>("settings");

  useEffect(() => setMounted(true), []);

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {},
      onError: (err) => console.error("Logout failed:", err),
    });
  };

  const currentTheme = mounted ? theme ?? "light" : "light";

  const {
    saveChapaKey,
    isLoading: savingChapa,
    error: chapaError,
    success: chapaSuccess,
    reset: resetChapa,
  } = useOrganizerSettings();

  const {
    editChapaKey,
    isLoading: editingChapa,
    error: editError,
    success: editSuccess,
    reset: resetEdit,
  } = useEditOrganizerChapaKey();

  const {
    chapaKey: existingChapaKey,
    isLoading: loadingChapaKey,
    error: chapaKeyError,
    refetch: refetchChapaKey,
  } = useGetOrganizerChapaKey();

  const [chapaKey, setChapaKey] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    if (existingChapaKey && !isEditing) {
      setChapaKey(existingChapaKey);
    } else if (!existingChapaKey && !isEditing) {
      setChapaKey("");
    }
  }, [existingChapaKey, isEditing]);

  const handleSaveChapa = async () => {
    try {
      await saveChapaKey(chapaKey);
      await refetchChapaKey();
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditChapa = async () => {
    try {
      await editChapaKey(chapaKey);
      await refetchChapaKey();
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (chapaSuccess || editSuccess) {
      const t = setTimeout(() => {
        resetChapa();
        resetEdit();
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [chapaSuccess, editSuccess, resetChapa, resetEdit]);

  const masked = (key?: string) => {
    if (!key) return "";
    if (key.length <= 10) return key;
    return `${key.slice(0, 6)}...${key.slice(-4)}`;
  };

  const isSaving = savingChapa || editingChapa;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#050505]  md:pl-56">
      <Sidebar active={route} onNavigate={setRoute} />
      <div className="flex-1 flex flex-col">
        <Topbar user={user} onLogout={handleLogout} />

        <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10 space-y-10 flex-1">
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
                className="rounded-lg border cursor-pointer border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-white px-3 py-2 focus:ring-2 focus:ring-red-400 outline-none transition-all"
              >
                <option value="light" className=" cursor-pointer">
                  Light
                </option>
                <option value="dark" className=" cursor-pointer">
                  Dark
                </option>
              </select>

              {currentTheme === "dark" ? (
                <Moon className="w-5 h-5 text-slate-300" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-500" />
              )}
            </div>
          </section>

          <section className="bg-white dark:bg-[#202127] border border-gray-200 dark:border-slate-700 rounded-2xl shadow-sm p-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Payment (Chapa)
            </h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
              Configure your Chapa API key for payment processing.
            </p>

            <div className="space-y-3">
              <label className="text-sm text-gray-700 dark:text-slate-300">
                Chapa Key
              </label>

              {loadingChapaKey ? (
                <div className="text-sm text-gray-500">Loading...</div>
              ) : existingChapaKey && !isEditing ? (
                <div className="flex items-center gap-3">
                  <div className="px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-white text-sm">
                    {masked(existingChapaKey)}
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-2 rounded-md bg-yellow-500 text-white hover:bg-yellow-600 transition-colors text-sm"
                  >
                    Edit
                  </button>
                </div>
              ) : (
                <input
                  type="text"
                  value={chapaKey}
                  onChange={(e) => setChapaKey(e.target.value)}
                  placeholder="Enter your Chapa key"
                  className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-white px-3 py-2 focus:ring-2 focus:ring-red-400 outline-none transition-all"
                />
              )}

              <div className="flex items-center gap-3">
                {isEditing || !existingChapaKey ? (
                  <>
                    <button
                      onClick={
                        existingChapaKey ? handleEditChapa : handleSaveChapa
                      }
                      disabled={isSaving || !chapaKey}
                      className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm"
                    >
                      {isSaving
                        ? "Saving..."
                        : existingChapaKey
                        ? "Save changes"
                        : "Save Chapa Key"}
                    </button>
                    <button
                      onClick={() => {
                        if (existingChapaKey) {
                          setChapaKey(existingChapaKey);
                          setIsEditing(false);
                        } else {
                          setChapaKey("");
                        }
                      }}
                      disabled={isSaving}
                      className="px-4 py-2 rounded-md bg-gray-200 dark:bg-slate-600 text-gray-800 dark:text-white hover:bg-gray-300 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </>
                ) : null}

                {(chapaSuccess || editSuccess) && (
                  <span className="text-sm text-green-600 dark:text-green-400">
                    Chapa key saved.
                  </span>
                )}

                {(chapaError || editError || chapaKeyError) && (
                  <span className="text-sm text-red-600 dark:text-red-400">
                    {"Failed to save chapa key"}
                  </span>
                )}
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-[#202127] border border-gray-200 dark:border-slate-700 rounded-2xl shadow-sm p-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Account
            </h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
              Manage your password and account security.
            </p>

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
    </div>
  );
}
