import { Calendar } from "lucide-react";

interface EmptyEventsPlaceholderProps {
  message?: string;
}

export function EmptyEventsPlaceholder({
  message = "No events found. Try adjusting your filters or search!",
}: EmptyEventsPlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500">
      <Calendar className="w-12 h-12 mb-4 text-primary" />
      <p className="text-md font-medium">{message}</p>
    </div>
  );
}
