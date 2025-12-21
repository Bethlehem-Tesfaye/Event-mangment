import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchNOtification, readAllNotification } from "../api/notificationApi";
import { queryClient } from "@/lib/queryClient";

export function useNotification() {
  return useQuery({
    queryKey: ["notification"],
    queryFn: () => fetchNOtification(),
  });
}

export function useReadAllNotification() {
  return useMutation({
    mutationFn: readAllNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification"] });
    },
  });
}
