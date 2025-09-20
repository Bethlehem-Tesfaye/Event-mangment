import { Skeleton } from "@/components/ui/skeleton";
import type { CategorySelectorProps } from "../types/event";

export function CategorySelector({ categories, selected, onSelect, isLoading }: CategorySelectorProps) {
  const placeholderCount = 6;

  return (
    <div className="overflow-x-auto scrollbar-none mb-8">
      <div className="flex gap-6 px-2">
        {isLoading
          ? Array.from({ length: placeholderCount }).map((_, idx) => (
              <div
                key={idx}
                className="relative whitespace-nowrap pb-2"
              >
                <Skeleton className="h-6 w-20 rounded" />
                <Skeleton className="absolute left-0 bottom-0 w-full h-0.5 bg-red-500 rounded-full" />
              </div>
            ))
          : ["All", ...categories].map((cat) => (
              <button
                key={cat}
                onClick={() => onSelect(selected === cat ? null : cat)}
                className={`relative whitespace-nowrap pb-2 font-medium transition-colors text-[12px] ${
                  selected === cat || (cat === "All" && !selected)
                    ? "text-red-500"
                    : "text-gray-700 hover:text-red-500"
                }`}
              >
                {cat}
                {(selected === cat || (cat === "All" && !selected)) && (
                  <span className="absolute left-0 bottom-0 w-full h-0.5 bg-red-500 rounded-full"></span>
                )}
              </button>
            ))}
      </div>
    </div>
  );
}
