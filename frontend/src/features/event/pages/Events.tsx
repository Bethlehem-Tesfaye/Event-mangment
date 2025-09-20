import { useCallback, useState } from "react";
import { Navbar } from "../componenets/Navbar";
import { Hero } from "../componenets/Hero";
import { BrowsePage } from "../componenets/BrowsePage";
import { Footer } from "../componenets/Footer";
import { useFilteredEvents } from "../hooks/useFilteredEvents";
import { useCategoryList } from "../hooks/useCategoryList";
import { useAuth } from "@/context/AuthContext";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useNavigate } from "react-router-dom";
function Events() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState<string>("");
  const { clearAuth } = useAuth();
  const { mutate: logout } = useLogout();
  const navigate = useNavigate();

  const limit = 1;

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
      onSuccess: () => {
        clearAuth();
        navigate("/login");
      },
      onError: (err) => {
        console.error("Logout failed:", err);
      },
    });
  };
  return (
    <div>
      <Navbar
        // isLoggedIn={user ? true : false}
        searchValue={search}
        onSearchChange={handleSearchChange}
        onLogout={handleLogout}
      />
      <div className="md:mx-[70px] md:mt-5">
        <Hero />
        <BrowsePage
          categories={categories.map((c: any) => c.name)}
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
      <Footer
        categories={categories.map((c: any) => c.name)}
        onSelectCategory={handleCategoryChange}
      />
    </div>
  );
}

export default Events;
