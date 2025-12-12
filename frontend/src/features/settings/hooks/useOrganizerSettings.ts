import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

interface OrganizerInput {
  chapaKey: string;
}

interface OrganizerResponse {
  message?: string;
}

const getApiUrl = (path: string) => {
  const env = (import.meta as any).env || {};
  const apiBase = env.VITE_AUTH_API_URL || env.VITE_API_URL || "";
  const base = apiBase.replace(/\/$/, "");
  return base ? `${base}${path.startsWith("/") ? "" : "/"}${path}` : path;
};

export const useOrganizerSettings = () => {
  const mutation = useMutation<OrganizerResponse, any, OrganizerInput>({
    mutationFn: async (variables: OrganizerInput) => {
      const url = getApiUrl("/api/chapa/settings/chapa-key");
      const response = await axios.post(url, variables, {
        withCredentials: true,
      });
      return response.data as OrganizerResponse;
    },
    onError: () => {
      toast.error("Error saving Chapa key");
    },
    onSuccess: () => {
      toast.success("Chapa key saved");
    },
  });

  return {
    saveChapaKey: (chapaKey: string) => mutation.mutateAsync({ chapaKey }),
    isLoading: mutation.isPending,
    error: mutation.error,
    success: mutation.isSuccess,
    reset: mutation.reset,
  };
};

export const useGetOrganizerChapaKey = (opts?: { enabled?: boolean }) => {
  const query = useQuery({
    queryKey: ["organizerSettings", "chapaKey"],
    queryFn: async (): Promise<{ chapaKey?: string | null }> => {
      const url = getApiUrl("/api/chapa/settings/chapa-key");
      try {
        const res = await axios.get(url, { withCredentials: true });
        return { chapaKey: res.data?.chapaKey ?? null };
      } catch (err: any) {
        if (err?.response?.status === 404) return { chapaKey: null };
        throw err;
      }
    },
    enabled: opts?.enabled ?? true,
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    chapaKey: query.data?.chapaKey ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useEditOrganizerChapaKey = () => {
  const mutation = useMutation<OrganizerResponse, any, OrganizerInput>({
    mutationFn: async (variables: OrganizerInput) => {
      const url = getApiUrl("/api/chapa/settings/chapa-key");
      const response = await axios.put(url, variables, {
        withCredentials: true,
      });
      return response.data as OrganizerResponse;
    },
    onError: () => {
      toast.error("Error updating Chapa key");
    },
    onSuccess: () => {
      toast.success("Chapa key updated");
    },
  });

  return {
    editChapaKey: (chapaKey: string) => mutation.mutateAsync({ chapaKey }),
    isLoading: mutation.isPending,
    error: mutation.error,
    success: mutation.isSuccess,
    reset: mutation.reset,
  };
};
