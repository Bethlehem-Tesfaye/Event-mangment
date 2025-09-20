export interface BreadcrumbNavProps {
  currentPage: string;
}
export interface ProfileCardProps {
  profile: any;
  email?: string;
  editing: boolean;
  onEditToggle: () => void;
  children: ReactNode;
  onAvatarChange?: (file: File) => void;
}

export interface ProfileDisplayProps {
  profile: any;
}
export interface ProfileFormProps {
  profile: any;
  onChange: (field: string, value: string) => void;
  onSave: (e: React.FormEvent) => void;
  isSaving: boolean
}