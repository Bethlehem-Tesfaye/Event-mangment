import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type Stat = {
  title: string;
  value: string | number;
  hint?: string;
};

export default function StatCard({ stats }: { stats: Stat[] }) {
  return (
    <div className="flex flex-col md:flex-row md:gap-4 gap-4 md:justify-center md:items-center">
      {stats.map((s, i) => (
        <Card key={i} className="w-[300px]">
          <CardHeader>
            <CardTitle className="text-sm">{s.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{s.value}</div>
            {s.hint && <div className="text-xs text-muted-foreground mt-2">{s.hint}</div>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
