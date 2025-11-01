import { Skeleton } from "@/components/ui/skeleton";
import type { CategorySelectorProps } from "../types/event";

export function CategorySelector({
  categories,
  selected,
  onSelect,
  isLoading,
}: CategorySelectorProps) {
  const placeholderCount = 6;

  return (
    <div className="overflow-x-auto scrollbar-none mb-8">
      <div className="flex gap-6 px-2">
        {isLoading
          ? Array.from({ length: placeholderCount }).map((_, idx) => (
              <div key={idx} className="relative whitespace-nowrap pb-2">
                <Skeleton className="h-6 w-20 rounded" />
                <Skeleton className="absolute left-0 bottom-0 w-full h-0.5 bg-primary rounded-full" />
              </div>
            ))
          : ["All", ...categories].map((cat) => (
              <button
                key={cat}
                onClick={() => onSelect(selected === cat ? null : cat)}
                className={`relative whitespace-nowrap pb-2 font-medium transition-colors text-[12px] dark:text-gray-100 ${
                  selected === cat || (cat === "All" && !selected)
                    ? "text-primary"
                    : "text-gray-700 hover:text-primary"
                }`}
              >
                {cat}
                {(selected === cat || (cat === "All" && !selected)) && (
                  <span className="absolute left-0 bottom-0 w-full h-0.5 bg--primary rounded-full"></span>
                )}
              </button>
            ))}
      </div>
    </div>
  );
}
