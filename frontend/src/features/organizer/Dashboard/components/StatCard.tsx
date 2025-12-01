import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Users, DollarSign } from "lucide-react";
export default function StatCard({
  stats,
  loading,
  error,
}: {
  stats: {
    id?: string;
    title: string;
    value: string | number;
    hint?: string;
  }[];
  loading?: boolean;
  error?: unknown;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Skeleton className="h-24 w-full rounded-md" />
        <Skeleton className="h-24 w-full rounded-md" />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500">Failed to load stats.</p>;
  }

  // If there are fewer than 3 columns in layout, center them nicely
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
      {stats.map((item) => (
        <Card
          key={item.title}
          className="w-[350px] h-[160px] bg-white rounded-[10px] shadow-[0_0_2px_rgba(23,26,31,0.12)] p-6 flex flex-col justify-between"
        >
          <CardContent className="p-0 space-y-2">
            {/* Title */}
            <div className="text-sm text-muted-foreground flex items-center justify-between w-full">
              <span>{item.title}</span>
              {/* Auto icon match */}
              {item.title.toLowerCase().includes("revenue") && (
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              )}
              {item.title.toLowerCase().includes("event") && (
                <Calendar className="h-4 w-4 text-muted-foreground" />
              )}
              {item.title.toLowerCase().includes("attendee") && (
                <Users className="h-4 w-4 text-muted-foreground" />
              )}
            </div>

            {/* Value */}
            <div className="text-3xl font-semibold tracking-tight">
              {item.value}
            </div>

            {/* Hint */}
            {item.hint && (
              <div className="text-xs text-muted-foreground">{item.hint}</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
