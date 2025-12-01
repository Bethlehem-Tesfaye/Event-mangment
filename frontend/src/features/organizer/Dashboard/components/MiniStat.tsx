export default function MiniStat({
  label,
  sub,
}: {
  label: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col items-end text-right">
      <div className="text-sm font-semibold leading-none">{label}</div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}
