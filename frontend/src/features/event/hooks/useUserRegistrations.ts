import { useQuery } from "@tanstack/react-query";
import { fetchUserRegistrations } from "../api/eventsApi";

export const useUserRegistrations = () => {
  return useQuery({
    queryKey: ["user-registrations"],
    queryFn: fetchUserRegistrations,
  });
};
