import { createContext, useContext, useState, useEffect } from "react";
import { useMe } from "../features/auth/hooks/useMe.ts";

type User = { id: string; email: string; isVerified: boolean };

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// This ref will let Axios interceptor update auth
let externalSetAuth: ((user: User, token: string) => void) | null = null;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem("accessToken")
  );
  const [loading, setLoading] = useState(true);

  const { data, isSuccess, isFetching } = useMe();

  useEffect(() => {
    if (isSuccess && data?.user) {
      setUser(data.user);
      setLoading(false);
    } else if (!accessToken) {
      setLoading(false);
    } else if (isFetching) {
      setLoading(true);
    }
  }, [isSuccess, data, accessToken, isFetching]);

  const setAuth = (u: User, token: string) => {
    setUser(u);
    setAccessToken(token);
    localStorage.setItem("accessToken", token);
  };

  const clearAuth = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("accessToken");
  };

  useEffect(() => {
    externalSetAuth = setAuth;
    return () => {
      externalSetAuth = null;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, accessToken, setAuth, clearAuth, loading }}
    >
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
