import React, { useState, useEffect } from "react";
import { Spinner } from '@/components/ui/shadcn-io/spinner';
import { BreadcrumbNav } from "../components/BreadcrumbNav";
import { ProfileCard } from "../components/ProfileCard";
import { ProfileForm } from "../components/ProfileForm";
import { ProfileDisplay } from "../components/ProfileDisplay";
import { useProfile } from "../hooks/useProfile";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const {user} = useAuth()

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
      <div className="flex justify-center items-center min-h-screen">
      <Spinner/>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
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
  );
}
