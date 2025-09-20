import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { ProfileFormProps } from "../types/profile";

export function ProfileForm({ profile, onChange, onSave , isSaving}: ProfileFormProps) {
  return (
    <form onSubmit={onSave} className="grid gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>First Name</Label>
          <Input
            value={profile?.firstName ?? ""}
            onChange={(e) => onChange("firstName", e.target.value)}
          />
        </div>
        <div>
          <Label>Last Name</Label>
          <Input
            value={profile?.lastName ?? ""}
            onChange={(e) => onChange("lastName", e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label>Phone</Label>
        <Input
          value={profile?.phone ?? ""}
          onChange={(e) => onChange("phone", e.target.value)}
          className="max-w-xs"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>City</Label>
          <Input
            value={profile?.city ?? ""}
            onChange={(e) => onChange("city", e.target.value)}
          />
        </div>
        <div>
          <Label>Country</Label>
          <Input
            value={profile?.country ?? ""}
            onChange={(e) => onChange("country", e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label>Address</Label>
        <Input
          value={profile?.address ?? ""}
          onChange={(e) => onChange("address", e.target.value)}
        />
      </div>

      <Button type="submit" className="mt-4">
        {isSaving?"Saving...":"Save Changes"}
      </Button>
    </form>
  );
}
