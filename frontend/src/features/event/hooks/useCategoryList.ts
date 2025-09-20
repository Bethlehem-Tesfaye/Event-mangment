import { useCategories } from "./useCategories";

export const useCategoryList = () => {
  const { data, isLoading } = useCategories();
  const categories = Array.isArray(data) ? data : [];
  return { categories, isLoading };
};
