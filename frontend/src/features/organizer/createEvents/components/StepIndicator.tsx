interface StepIndicatorProps {
  step: number;
  label: string;
  activeStep: number;
}

export function StepIndicator({ step, label, activeStep }: StepIndicatorProps) {
  return (
    <div className={`flex-1 text-center py-2 rounded ${step === activeStep ? "bg-primary text-white font-bold" : "bg-gray-100 text-gray-500"}`}>
      {label}
    </div>
  );
}