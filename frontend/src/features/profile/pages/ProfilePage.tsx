import React, { useState, useEffect } from "react";
import { BreadcrumbNav } from "../components/BreadcrumbNav";
import { ProfileCard } from "../components/ProfileCard";
import { ProfileForm } from "../components/ProfileForm";
import { ProfileDisplay } from "../components/ProfileDisplay";
import { useProfile } from "../hooks/useProfile";
import { Navbar } from "@/features/event/componenets/Navbar";
import { useAuth } from "@/context/AuthContext";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const { user } = useAuth();
  const { mutate: logout, isPending: logoutLoading } = useLogout();
  const { clearAuth } = useAuth();

  const { profile, isFetching, isUpdating, updateProfile, refetchProfile } =
    useProfile({
      onSuccess: (data) => console.log("Updated!", data),
      onError: (err) => console.error(err),
    });

  const [formProfile, setFormProfile] = useState<any>(profile);

  useEffect(() => {
    setFormProfile(profile);
  }, [profile]);

  const handleChange = (field: string, value: string) => {
    setFormProfile((prev: any) => ({ ...prev, [field]: value }));
  };
  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => clearAuth(),
      onError: (err) => console.error("Logout failed:", err),
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProfile) return;

    const formData = new FormData();
    Object.entries(formProfile).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value instanceof File ? value : String(value));
      }
    });

    await updateProfile(formData);
    setEditing(false);
    refetchProfile();
  };

  if (isFetching) {
    return (
      <div className="dark:bg-gray-900 min-h-screen">
        <Navbar
          onLogout={handleLogout}
          logoutLoading={logoutLoading}
          showSearch={false}
        />
        <div className="container max-w-4xl mx-auto py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-48 rounded" />

            <div className="p-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-sm">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-4 w-1/3 rounded" />
                  <Skeleton className="h-3 w-1/2 rounded" />
                </div>
              </div>
            </div>
            <div className="p-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-sm grid gap-4">
              <Skeleton className="h-10 rounded" />
              <Skeleton className="h-10 rounded" />
              <Skeleton className="h-10 rounded" />
              <Skeleton className="h-10 w-40 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dark:bg-gray-900 min-h-screen">
      <Navbar
        onLogout={handleLogout}
        logoutLoading={logoutLoading}
        showSearch={false}
      />
      <div className="container max-w-4xl mx-auto py-8 ">
        <BreadcrumbNav currentPage="Profile" />
        <ProfileCard
          profile={profile}
          email={user?.email}
          editing={editing}
          onEditToggle={() => setEditing(!editing)}
          onAvatarChange={(file) =>
            setFormProfile((prev: any) => ({ ...prev, picture: file }))
          }
        >
          {editing ? (
            <ProfileForm
              profile={formProfile}
              onChange={handleChange}
              onSave={handleSave}
              isSaving={isUpdating}
            />
          ) : (
            <ProfileDisplay profile={profile} />
          )}
        </ProfileCard>
      </div>
    </div>
  );
}
