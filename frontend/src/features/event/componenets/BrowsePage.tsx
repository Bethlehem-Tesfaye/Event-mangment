import { CategorySelector } from "./CategorySelector";
import { EventGrid } from "./EventGrid";
import type { BrowsePageProps } from "../types/event";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";

function PaginationControl({
  totalCount,
  limit,
  currentPage,
  onPageChange,
}: {
  totalCount: number;
  limit: number;
  currentPage: number;
  onPageChange: (p: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / Math.max(1, limit)));
  if (totalPages <= 1) return null;

  const delta = 2;
  const pages: (number | "left-ellipsis" | "right-ellipsis")[] = [];

  const left = Math.max(2, currentPage - delta);
  const right = Math.min(totalPages - 1, currentPage + delta);

  pages.push(1);
  if (left > 2) pages.push("left-ellipsis");
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < totalPages - 1) pages.push("right-ellipsis");
  if (totalPages > 1) pages.push(totalPages);

  return (
    <Pagination className="mt-6">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={(e) => {
              e.preventDefault();
              onPageChange(Math.max(1, currentPage - 1));
            }}
          />
        </PaginationItem>

        {pages.map((p, idx) =>
          p === "left-ellipsis" || p === "right-ellipsis" ? (
            <PaginationItem key={p + idx}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={p}>
              <PaginationLink
                isActive={p === currentPage}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (p !== currentPage) onPageChange(Number(p));
                }}
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            onClick={(e) => {
              e.preventDefault();
              onPageChange(Math.min(totalPages, currentPage + 1));
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export function BrowsePage({
  categories,
  selectedCategory,
  onSelectCategory,
  events,
  eventsLoading,
  categoriesLoading,
  currentPage,
  totalCount,
  onPageChange,
  limit,
}: BrowsePageProps) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-8">
      <div className="text-left mb-4">
        <h2 className="text-2xl md:text-3xl font-bold">Browse Events</h2>
        <p className="text-muted-foreground mt-1">Explore events by category</p>
      </div>

      <CategorySelector
        categories={categories}
        selected={selectedCategory}
        onSelect={onSelectCategory}
        isLoading={categoriesLoading}
      />

      <EventGrid events={events} isLoading={eventsLoading} />

      <div className="flex justify-end">
        <PaginationControl
          totalCount={totalCount}
          limit={limit}
          currentPage={currentPage}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
