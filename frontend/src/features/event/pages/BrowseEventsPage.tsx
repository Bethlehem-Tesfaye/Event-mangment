import { useState, useCallback } from "react";
import { Navbar } from "../componenets/Navbar";
import { BrowsePage } from "../componenets/BrowsePage";
import { useFilteredEvents } from "../hooks/useFilteredEvents";
import { useCategoryList } from "../hooks/useCategoryList";
import { useCurrentUser } from "../../auth/hooks/useCurrentUser";
import { useLogout } from "@/features/auth/hooks/useLogout";

export default function BrowseEventsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState<string>("");

  const { user } = useCurrentUser();
  const { mutate: logout, isPending: logoutLoading } = useLogout();

  const limit = 20;

  const {
    events,
    totalCount,
    isLoading: eventsLoading,
  } = useFilteredEvents(selectedCategory, currentPage, limit, search);

  const { categories, isLoading: categoriesLoading } = useCategoryList();

  const handleCategoryChange = useCallback((cat: string | null) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  }, []);

  const handleSearchChange = useCallback((q: string) => {
    setSearch(q);
    setCurrentPage(1);
  }, []);

  const handleLogout = () => {
    logout(undefined, {
      onError: (err) => console.error(err),
    });
  };

  return (
    <div>
      <Navbar
        searchValue={search}
        onSearchChange={handleSearchChange}
        onLogout={handleLogout}
        logoutLoading={logoutLoading}
        user={user as any}
      />
      <div className="md:mx-[70px] md:mt-5">
        <BrowsePage
          categories={categories.map((c) => c.name)}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategoryChange}
          events={events}
          eventsLoading={eventsLoading}
          categoriesLoading={categoriesLoading}
          totalCount={totalCount}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          limit={limit}
        />
      </div>
    </div>
  );
}
