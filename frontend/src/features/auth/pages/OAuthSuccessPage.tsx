import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OAuthSuccessPage() {
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const accessToken = params.get("accessToken");
      // store access token so AuthProvider / axios can use it
      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
      }
    } catch (e) {
      // ignore
    } finally {
      window.location.replace("/");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div>Signing you in…</div>
    </div>
  );
}
