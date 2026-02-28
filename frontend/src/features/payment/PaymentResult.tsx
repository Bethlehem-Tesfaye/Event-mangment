import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "@/lib/axios";
import { Loader2 } from "lucide-react";

export default function PaymentResult() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const txRef = params.get("tx_ref");

  useEffect(() => {
    const run = async () => {
      if (!txRef) return navigate("/user/myevents", { replace: true });

      try {
        const { data } = await api.get("/chapa/result", {
          params: { tx_ref: txRef },
        });

        if (data?.registrationId) {
          navigate(
            `/registrations/${data.registrationId}?status=success&tx_ref=${txRef}`,
            { replace: true },
          );
          return;
        }

        navigate("/user/myevents", { replace: true });
      } catch {
        navigate("/user/myevents", { replace: true });
      }
    };

    run();
  }, [txRef, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <p className="text-lg">Verifying payment...</p>
        <Loader2 className="h-6 w-6 animate-spin text-gray-700" />
      </div>
    </div>
  );
}
