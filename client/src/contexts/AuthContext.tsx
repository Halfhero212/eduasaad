import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    enabled: !!token,
    retry: false,
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const res = await apiRequest("POST", "/api/auth/login", { email, password });
      const data = await res.json();
      // Store token immediately in localStorage so it's available for the next query
      localStorage.setItem("token", data.token);
      return data;
    },
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData(["/api/auth/me"], data.user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async ({ fullName, email, password }: { fullName: string; email: string; password: string }) => {
      const res = await apiRequest("POST", "/api/auth/register", { fullName, email, password });
      const data = await res.json();
      // Store token immediately in localStorage so it's available for the next query
      localStorage.setItem("token", data.token);
      return data;
    },
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData(["/api/auth/me"], data.user);
    },
  });

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  const register = async (fullName: string, email: string, password: string) => {
    await registerMutation.mutateAsync({ fullName, email, password });
  };

  const logout = async () => {
    setToken(null);
    queryClient.clear();
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function getAuthToken(): string | null {
  return localStorage.getItem("token");
}
