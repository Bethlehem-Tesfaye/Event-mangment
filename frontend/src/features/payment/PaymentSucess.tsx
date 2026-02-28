import { useLogout } from "../auth/hooks/useLogout";
import { useCurrentUser } from "../auth/hooks/useCurrentUser";
import { Navbar } from "../event/componenets/Navbar";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function PaymentSucess() {
  const { mutate: logout, isPending: logoutLoading } = useLogout();
  const { user } = useCurrentUser(); // replaced useAuth
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const txRef = params.get("tx_ref");

  useEffect(() => {
    if (txRef) {
      navigate(`/payment/result?tx_ref=${txRef}`, { replace: true });
    }
  }, [txRef, navigate]);

  const handleLogout = () => {
    logout(undefined, {
      onError: (err) => console.error("Logout failed:", err),
    });
  };
  return (
    <div>
      {" "}
      <Navbar
        onLogout={handleLogout}
        logoutLoading={logoutLoading}
        showSearch={false}
        user={user as any}
      />
    </div>
  );
}

export default PaymentSucess;
