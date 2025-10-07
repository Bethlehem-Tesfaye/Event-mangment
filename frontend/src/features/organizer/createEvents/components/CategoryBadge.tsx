import type { Category } from "../types/createEvent";

interface CategoryBadgeProps {
  category: Category;
  selected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

export function CategoryBadge({ category, selected, onSelect, onRemove }: CategoryBadgeProps) {
  return (
    <span
      className={`relative px-3 py-1 rounded-full text-sm font-medium cursor-pointer transition
        ${selected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"}
      `}
      onClick={() => {
        if (!selected) onSelect();
      }}
    >
      {category.name}
      {selected && (
        <button
          type="button"
          className="absolute -top-2 -right-2 bg-white text-blue-600 rounded-full w-5 h-5 flex items-center justify-center border border-blue-200 shadow"
          onClick={e => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label="Remove category"
        >
          ×
        </button>
      )}
    </span>
  );
}