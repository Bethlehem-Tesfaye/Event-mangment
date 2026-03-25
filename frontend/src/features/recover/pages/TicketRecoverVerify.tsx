import { useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function TicketRecoverVerify() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Invalid or missing recovery link.</p>
      </div>
    );
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("Please enter the 6-digit code.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${import.meta.env.VITE_AUTH_API_URL}/api/auth/ticket/recover/verify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ token, otp }),
        },
      );

      const data = await res.json().catch(() => null);

      if (!res.ok || data?.error) {
        setError(
          data?.error ||
            "Verification failed. Please check the code and try again.",
        );
        return;
      }

      const { redirectUrl } = data;

      window.location.href = redirectUrl; // Redirect to My Registration
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded-lg p-6 w-full max-w-sm"
      >
        <h1 className="text-xl font-semibold mb-2">Verify Ticket Access</h1>
        <p className="text-sm text-gray-600 mb-4">
          Enter the 6-digit code sent to your email.
        </p>

        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          className="w-full border rounded px-3 py-2 text-center tracking-widest text-lg"
          placeholder="••••••"
        />

        {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full bg-black text-white py-2 rounded disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
      </form>
    </div>
  );
}
