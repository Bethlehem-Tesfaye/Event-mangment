import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type Stat = { title: string; value: string | number; hint?: string };

export default function StatCard({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((s, i) => (
        <Card key={i} className="rounded-2xl shadow-sm hover:shadow-md transition">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{s.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{s.value}</div>
            {s.hint && <div className="text-xs text-muted-foreground mt-1">{s.hint}</div>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
