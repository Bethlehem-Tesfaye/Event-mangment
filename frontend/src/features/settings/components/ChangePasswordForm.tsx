import React, { useState } from "react";

type User = {
  id: string;
  email: string;
  isVerified: boolean;
  hasPassword: boolean;
};

type Props = {
  changePassword: (...args: any[]) => Promise<any>;
  isLoading?: boolean;
  hasPassword?: boolean;
  user: User | null;
};

export function ChangePasswordForm({
  changePassword,
  isLoading,
  hasPassword,
  user,
}: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isDisabled = !user;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDisabled) return;
    setMessage(null);
    setError(null);

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirm) {
      setError("New password and confirmation do not match.");
      return;
    }

    try {
      if (hasPassword) {
        await changePassword({ currentPassword, newPassword });
      } else {
        await changePassword({ newPassword });
      }
      setMessage("Password set successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
    } catch (err: any) {
      setError(err?.message ?? "Failed to change password");
    }
  };

  return (
    <form
      onSubmit={submit}
      className={`w-full max-w-md md:max-w-lg space-y-3 p-4 rounded-lg text-sm bg-gray-100 dark:bg-[#1b1b1f] ${
        isDisabled ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      {isDisabled && (
        <p className="text-xs text-gray-500 mb-2">
          You must be logged in to change your password.
        </p>
      )}

      {hasPassword ? (
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
            Current password
          </label>

          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            disabled={isDisabled}
            className="mt-1 block w-full max-w-sm rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-[#202127] px-3 py-1.5 focus:ring-2 focus:ring-red-500 outline-none transition-all text-sm disabled:bg-gray-100 disabled:dark:bg-[#111111]"
          />
        </div>
      ) : (
        ""
      )}

      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
          New password
        </label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={8}
          disabled={isDisabled}
          className="mt-1 block w-full max-w-sm rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-[#202127] px-3 py-1.5 focus:ring-2 focus:ring-red-500 outline-none transition-all text-sm disabled:bg-gray-100 disabled:dark:bg-[#111111]"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          At least 8 characters.
        </p>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
          Confirm new password
        </label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          disabled={isDisabled}
          className="mt-1 block w-full max-w-sm rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-[#202127] px-3 py-1.5 focus:ring-2 focus:ring-red-500 outline-none transition-all text-sm disabled:bg-gray-100 disabled:dark:bg-[#111111]"
        />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
      {message && <p className="text-xs text-green-600">{message}</p>}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading || isDisabled}
          className="px-4 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-70 transition-all text-sm"
        >
          {isLoading
            ? "Saving..."
            : hasPassword
            ? "Change password"
            : "Change password"}
        </button>
      </div>
    </form>
  );
}
