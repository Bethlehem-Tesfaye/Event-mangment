import { useState, useEffect } from "react";

export const useFirstLoad = (): [boolean, () => void] => {
  const [isFirstLoad, setIsFirstLoad] = useState(() => {
    return !sessionStorage.getItem("hasLoaded");
  });

  useEffect(() => {
    if (isFirstLoad) {
      sessionStorage.setItem("hasLoaded", "true");
    }
  }, [isFirstLoad]);

  const finishLoading = () => setIsFirstLoad(false);

  return [isFirstLoad, finishLoading];
};
