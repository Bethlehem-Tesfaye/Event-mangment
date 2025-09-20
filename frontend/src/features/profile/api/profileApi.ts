import { api } from "@/lib/axios";

export const fetchProfile = async () => {
  const { data } = await api.get(`/users/profile`);
  return data.data.profile;
};

export const updateProfile = async (profileData: any) => {
  let payload: FormData | any = profileData;
  if (profileData.picture instanceof File) {
    payload = new FormData();
    Object.entries(profileData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        payload.append(key, value instanceof File ? value : value.toString());
      }
    });
  }

  const { data } = await api.put(`/users/profile`, payload, {
    withCredentials: true,
    headers: payload instanceof FormData ? { "Content-Type": "multipart/form-data" } : { "Content-Type": "application/json" },
  });

  return data.data.profile;
};
