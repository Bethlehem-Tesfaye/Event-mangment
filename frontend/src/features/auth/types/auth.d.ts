export interface AuthLayoutProps {
  title: string;
  children: React.ReactNode;
}

export interface LoginFormProps {
  onSubmit: (values: { email: string; password: string }) => void | Promise<void>;
  onSocialClick: (provider: string) => void;
  toggleRegister: () => void;
  isLoading: boolean;
}


export interface RegisterFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onSocialClick: (provider: string) => void;
  toggleLogin: () => void;
}

export interface SocialButtonsProps {
  onClick: (provider: string) => void;
}

