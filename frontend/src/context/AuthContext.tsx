import { createContext, useContext, useState, useEffect } from "react";
import { useMe } from "../features/auth/hooks/useMe.ts";

type User = { id: string; email: string };

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// This ref will let Axios interceptor update auth
let externalSetAuth: ((user: User, token: string) => void) | null = null;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const { data, isSuccess, isLoading } = useMe();

useEffect(() => {
    if (isSuccess) {
      setUser(data?.user ?? null);
    }
  }, [isSuccess, data]);

  const setAuth = (u: User, token: string) => {
    setUser(u);
    setAccessToken(token);
  };

  const clearAuth = () => {
    setUser(null);
    setAccessToken(null);
  };

  useEffect(() => {
    externalSetAuth = setAuth;
    return () => {
      externalSetAuth = null;
    };
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, setAuth, clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const getExternalSetAuth = () => externalSetAuth;
