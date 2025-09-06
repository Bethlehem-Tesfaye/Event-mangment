export interface AuthLayoutProps {
  title: string;
  children: React.ReactNode;
}

export interface LoginFormProps {
  onSubmit: (values: {
    email: string;
    password: string;
  }) => void | Promise<void>;
  onSocialClick: (provider: string) => void;
  onRegister: () => void;
  isLoading: boolean;
}


export interface RegisterFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onSocialClick: (provider: string) => void;
  onLogin: () => void;
}

export interface SocialButtonsProps {
  onClick: (provider: string) => void;
}

interface UseLoginOptions {
  onSuccess?: (data: LoginResponse) => void;
  onError?: (error: Error) => void;
}

interface UseRegisterOptions {
  onSuccess?: (data: RegisterResponse) => void;
  onError?: (error: Error) => void;
}
