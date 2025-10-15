import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { InputFieldProps, PurchaseModalProps } from "../types/event";
import { usePurchaseTicket } from "../hooks/usePurchaseTicket";
import { useAuth } from "@/context/AuthContext";

const InputField = React.memo(function InputField({
  label,
  value,
  onChange,
  type = "text",
  min,
  max,
  required = false,
}: InputFieldProps) {
  return (
    <div className="flex flex-col w-full">
      <label className="text-sm font-medium mb-1">{label}</label>
      <input
        type={type}
        value={String(value ?? "")}
        onChange={(e) =>
          onChange(type === "number" ? Number(e.target.value) : e.target.value)
        }
        min={min}
        max={max}
        required={required}
        className="px-4 py-2 rounded-lg border text-sm transition w-full border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-500"
      />
    </div>
  );
});

const PurchaseModalInner: React.FC<PurchaseModalProps> = ({
  ticket,
  open,
  onClose,
  onPurchase,
}) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [attendeeName, setAttendeeName] = useState("");
  const [attendeeEmail, setAttendeeEmail] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [agree, setAgree] = useState(false);

  const mutation = usePurchaseTicket();

  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        setStep(1);
        setAttendeeName("");
        setAttendeeEmail("");
        setQuantity(1);
        setAgree(false);
        mutation.reset();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open, mutation]);

  useEffect(() => {
    if (user?.email) {
      setAttendeeEmail(user.email);
    } else {
      setAttendeeEmail("");
    }
  }, [user?.email, user]);

  const numericPrice = useMemo(() => {
    if (!ticket) return 0;
    const n = Number(ticket.price);
    return Number.isFinite(n) ? n : 0;
  }, [ticket]);

  // guests must provide email; logged-in users do not
  const canContinue = Boolean(
    attendeeName && (user ? true : attendeeEmail) && quantity > 0
  );

  const handleConfirm = useCallback(() => {
    if (!ticket) return;
    if (mutation.isPending) return;

    mutation.mutate(
      {
        eventId: ticket.eventId,
        ticketId: ticket.id,
        attendeeName,
        attendeeEmail: user ? user.email : attendeeEmail,
        quantity,
      },
      {
        onSuccess: () => {
          onPurchase(attendeeName, attendeeEmail, quantity);
          onClose();
        },
      }
    );
  }, [
    ticket,
    attendeeName,
    attendeeEmail,
    quantity,
    mutation,
    onPurchase,
    onClose,
    user,
  ]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-red-600">
            {step === 1 ? "Attendee Information" : "Confirm Purchase"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 flex flex-col gap-4">
            {step === 1 && (
              <>
                <InputField
                  label="Full Name"
                  value={attendeeName}
                  onChange={setAttendeeName}
                  required
                />
                {!user ? (
                  <InputField
                    label="Email"
                    type="email"
                    value={attendeeEmail}
                    onChange={setAttendeeEmail}
                    required
                  />
                ) : (
                  <div className="sr-only" aria-hidden="true">
                    <InputField
                      label="Email"
                      type="email"
                      value={attendeeEmail}
                      onChange={() => {}}
                      required={false}
                    />
                  </div>
                )}

                <InputField
                  label="Quantity"
                  type="number"
                  value={quantity}
                  onChange={(v) =>
                    setQuantity(typeof v === "number" && !isNaN(v) ? v : 1)
                  }
                  min={1}
                  max={ticket?.maxPerUser ?? 1}
                  required
                />
                <p className="text-xs text-gray-500">
                  Max per user: {ticket?.maxPerUser}
                </p>
              </>
            )}

            {step === 2 && ticket && (
              <>
                <div className="border rounded-lg p-4 bg-gray-50 shadow-sm">
                  <h3 className="font-semibold text-gray-800">{ticket.type}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    ${ticket.price} × {quantity} ={" "}
                    <span className="font-semibold text-red-600">
                      ${numericPrice * quantity}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Attendee: {attendeeName}{" "}
                    {user ? `(${user.email})` : `(${attendeeEmail})`}
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox
                    id="agree"
                    checked={agree}
                    onCheckedChange={(c) => setAgree(Boolean(c))}
                  />
                  <span className="text-sm leading-snug">
                    I agree to the{" "}
                    <span className="underline cursor-pointer">Terms</span> and{" "}
                    <span className="underline cursor-pointer">
                      Privacy Policy
                    </span>
                    .
                  </span>
                </div>
              </>
            )}

            <DialogFooter className="mt-6 flex gap-3">
              {step === 1 ? (
                <Button
                  className="bg-red-600 hover:bg-red-700 rounded-lg shadow"
                  onClick={() => setStep(2)}
                  disabled={!canContinue}
                >
                  Continue
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="rounded-lg"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    className="bg-red-600 hover:bg-red-700 rounded-lg shadow"
                    onClick={handleConfirm}
                    disabled={!agree || mutation.isPending}
                  >
                    {mutation.isPending ? "Processing..." : "Purchase"}
                  </Button>
                </>
              )}
            </DialogFooter>
          </div>

          {ticket && (
            <div className="border rounded-lg p-4 bg-white shadow-sm flex flex-col gap-2">
              <h3 className="font-semibold mb-1">Order Summary</h3>
              <p className="text-sm">{ticket.type}</p>
              <p className="text-sm text-gray-600">
                ${ticket.price} × {quantity}
              </p>
              <p className="font-bold text-red-600 mt-2">
                Total: ${numericPrice * quantity}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(PurchaseModalInner);
