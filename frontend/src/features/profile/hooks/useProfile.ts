import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchProfile, updateProfile } from "../api/profileApi";
import { toast } from "sonner";

export type UseProfileOptions = {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
};

export const useProfile = (options?: UseProfileOptions) => {
  const { data, isLoading: isFetching, error: fetchError, refetch } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
  });

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedProfile) => {
      toast.success("Profile updated successfully!");
      options?.onSuccess?.(updatedProfile);
    },
    onError: (error: any) => {
      toast.error("Failed to update profile");
      options?.onError?.(error);
    },
  });

  return {
    profile: data,
    isFetching,
    fetchError,
    refetchProfile: refetch,
    updateProfile: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    updateError: mutation.error,
  };
};
