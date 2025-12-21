import { X, Plus } from "lucide-react";

type Category = { id: number; name: string };

interface CategoryBadgeProps {
  category: Category | any;
  selected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

export function CategoryBadge({
  category,
  selected,
  onSelect,
  onRemove,
}: CategoryBadgeProps) {
  const ACCENT = "oklch(0.645 0.246 16.439)";

  return (
    <span
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          if (!selected) onSelect();
        }
      }}
      onClick={() => {
        if (!selected) onSelect();
      }}
      className={`relative inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium cursor-pointer select-none transition-all
        ${selected ? "text-white" : "text-neutral-800 dark:text-neutral-200"}
        ${!selected ? "hover:bg-neutral-100 dark:hover:bg-neutral-800" : ""}`}
      style={{
        background: selected ? ACCENT : undefined,
        border: selected ? "none" : "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <span className="truncate max-w-xs">
        {category?.name ?? String(category)}
      </span>

      {selected ? (
        <div
          className="ml-2 -mr-2 bg-white/90 dark:bg-neutral-900/80 rounded-full w-6 h-6 flex items-center justify-center border border-neutral-200 dark:border-neutral-700 shadow-sm"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          title="Remove category"
          aria-label={`Remove ${category?.name ?? "category"}`}
          role="button"
        >
          <X size={12} color={ACCENT} />
        </div>
      ) : (
        <div
          className="ml-2 -mr-2 bg-white/90 dark:bg-neutral-900/80 rounded-full w-6 h-6 flex items-center justify-center border border-neutral-200 dark:border-neutral-700 shadow-sm"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          title="Add category"
          aria-label={`Add ${category?.name ?? "category"}`}
          role="button"
        >
          <Plus size={12} style={{ opacity: 0.9 }} />
        </div>
      )}
    </span>
  );
}
