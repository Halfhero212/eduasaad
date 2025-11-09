import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, whatsappNumber: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    const savedToken = localStorage.getItem("token");
    console.log("AuthProvider: Initial token from localStorage:", savedToken ? "exists" : "null");
    return savedToken;
  });

  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    enabled: !!token,
    retry: false,
    staleTime: 0, // Always fetch fresh user data on mount
    refetchOnMount: true, // Refetch when component mounts
  });

  // Debug logging
  useEffect(() => {
    console.log("Auth state:", { 
      hasToken: !!token, 
      hasUser: !!user, 
      isLoading, 
      hasError: !!error,
      userName: user?.fullName 
    });
  }, [token, user, isLoading, error]);

  // If auth fails (401), clear the token
  useEffect(() => {
    if (error && token) {
      console.log("Auth failed, clearing token");
      localStorage.removeItem("token");
      setToken(null);
    }
  }, [error, token]);

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
    mutationFn: async ({ fullName, email, whatsappNumber, password }: { fullName: string; email: string; whatsappNumber: string; password: string }) => {
      const res = await apiRequest("POST", "/api/auth/register", { fullName, email, whatsappNumber, password });
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

  const register = async (fullName: string, email: string, whatsappNumber: string, password: string) => {
    await registerMutation.mutateAsync({ fullName, email, whatsappNumber, password });
  };

  const logout = async () => {
    localStorage.removeItem("token");
    setToken(null);
    queryClient.setQueryData(["/api/auth/me"], null);
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
