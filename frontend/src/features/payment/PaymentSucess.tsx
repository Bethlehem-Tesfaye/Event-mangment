import { useLogout } from "../auth/hooks/useLogout";
import { useCurrentUser } from "../auth/hooks/useCurrentUser";
import { Navbar } from "../event/componenets/Navbar";

function PaymentSucess() {
  const { mutate: logout, isPending: logoutLoading } = useLogout();
  const { user } = useCurrentUser(); // replaced useAuth

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
