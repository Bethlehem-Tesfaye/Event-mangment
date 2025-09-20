import { useRef, useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Edit, Upload } from "lucide-react";
import type { ProfileCardProps } from "../types/profile";


export function ProfileCard({
  profile,
  email,
  editing,
  onEditToggle,
  children,
  onAvatarChange,
}: ProfileCardProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(profile?.picture ?? null);

  useEffect(() => {
    setPreview(profile?.picture ?? null);
  }, [profile?.picture]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file)); 
      onAvatarChange?.(file); 
    }
  };

  return (
    <Card className="shadow-lg rounded-2xl">
      <CardHeader className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
        <div className="relative">
          <Avatar className="h-20 w-20">
            <AvatarImage src={preview ?? "/placeholder.png"} />
            <AvatarFallback>
              {profile?.firstName?.[0] ?? "U"}
              {profile?.lastName?.[0] ?? ""}
            </AvatarFallback>
          </Avatar>

          {editing && (
            <>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <Button
                variant="outline"
                size="icon"
                className="absolute bottom-0 right-0 p-1 rounded-full bg-white/80 hover:bg-white"
                onClick={handleUploadClick}
              >
                <Upload className="h-4 w-4 text-gray-600" />
              </Button>
            </>
          )}
        </div>

        <div className="flex-1">
          <CardTitle className="text-2xl md:text-3xl font-extrabold">
            {profile?.firstName} {profile?.lastName}
          </CardTitle>
          <p className="text-sm md:text-base text-gray-600">{email}</p>
        </div>

        <Button
          variant="outline"
          className="mt-2 md:mt-0 ml-auto"
          onClick={onEditToggle}
        >
          <Edit className="mr-2 h-4 w-4" /> {editing ? "Cancel" : "Edit"}
        </Button>
      </CardHeader>

      <Separator />
      <CardContent className="mt-4">{children}</CardContent>
    </Card>
  );
}
