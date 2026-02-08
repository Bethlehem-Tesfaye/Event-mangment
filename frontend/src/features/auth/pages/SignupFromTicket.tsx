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
    <form onSubmit={handleSubmit}>
      <p>Creating account for {state.email}</p>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Choose a password"
      />
      {error && <p>{error}</p>}
      <button type="submit">Create account and claim ticket</button>
    </form>
  );
}
