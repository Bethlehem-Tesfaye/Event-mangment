import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function SignupFromTicket() {
  const location = useLocation() as any;
  const navigate = useNavigate();
  const state = location.state as
    | { email: string; registrationId: number; anonymousUserId: string }
    | undefined;

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (!state?.email || !state.registrationId || !state.anonymousUserId) {
    return <p>Invalid recovery state.</p>;
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");

    try {
      // 1) Better Auth sign-up (email + password)
      const resSignUp = await fetch(
        `${import.meta.env.VITE_AUTH_API_URL}/api/auth/sign-up/email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            email: state.email,
            password,
          }),
        },
      );

      const dataSign = await resSignUp.json().catch(() => null);
      if (!resSignUp.ok || dataSign?.error) {
        setError(dataSign?.error || "Sign up failed");
        return;
      }

      // 2) Attach from anonymous
      const resAttach = await fetch(
        `${import.meta.env.VITE_AUTH_API_URL}/api/tickets/recover/attach-from-anonymous`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            registrationId: state.registrationId,
            anonymousUserId: state.anonymousUserId,
            email: state.email,
          }),
        },
      );

      const dataAttach = await resAttach.json().catch(() => null);

      if (resAttach.ok && dataAttach?.redirectUrl) {
        window.location.href = dataAttach.redirectUrl;
      } else if (resAttach.ok) {
        window.location.href = `/registrations/${state.registrationId}`;
      } else {
        navigate("/my-tickets");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  // simple form: show email, ask for password
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-xl shadow-md p-6 space-y-4"
      >
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Claim your ticket
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Creating account for{" "}
            <span className="font-medium text-gray-800">{state.email}</span>
          </p>
        </div>

        <label className="block text-sm font-medium text-gray-700">
          Choose a password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter a strong password"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
        />

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition"
        >
          Create account and claim ticket
        </button>
      </form>
    </div>
  );
}
