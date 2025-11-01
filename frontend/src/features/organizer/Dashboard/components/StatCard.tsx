import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatCard({
  stats,
  loading,
  error,
}: {
  stats: { title: string; value: string | number; hint?: string }[];
  loading?: boolean;
  error?: unknown;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-24 w-full rounded-md" />
        <Skeleton className="h-24 w-full rounded-md" />
        <Skeleton className="h-24 w-full rounded-md" />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500">Failed to load stats.</p>;
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((s) => (
        <Card key={s.title}>
          <CardContent className="flex flex-col">
            <div className="text-sm text-muted-foreground">{s.title}</div>
            <div className="text-2xl font-bold">{s.value}</div>
            {s.hint && <div className="text-xs text-muted-foreground">{s.hint}</div>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
