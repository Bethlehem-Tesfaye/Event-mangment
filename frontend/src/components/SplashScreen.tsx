import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "./custom/Loader";
import { useAuth } from "../context/AuthContext";

export default function SplashScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate(user ? "/browse-event" : "/login", { replace: true });
    }, 7000);
    return () => clearTimeout(timeout);
  }, [navigate, user]);

  return (
    <div className=" w-full min-h-screen bg-white">
      <Loader durationPerLogo={1000} iterations={1} />
    </div>
  );
}
