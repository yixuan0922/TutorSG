"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { usePathname } from "next/navigation";

interface AuthState {
  tutorId: string | null;
  adminId: string | null;
  userType: "tutor" | "admin" | null;
  isLoggedIn: boolean;
  isTutor: boolean;
  isAdmin: boolean;
}

interface AuthContextType extends AuthState {
  setTutorAuth: (tutorId: string) => void;
  setAdminAuth: (adminId: string) => void;
  clearAuth: () => void;
  refreshAuth: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [authState, setAuthState] = useState<AuthState>({
    tutorId: null,
    adminId: null,
    userType: null,
    isLoggedIn: false,
    isTutor: false,
    isAdmin: false,
  });

  const refreshAuth = useCallback(() => {
    if (typeof window === "undefined") return;

    const tutorId = localStorage.getItem("tutorId");
    const adminId = localStorage.getItem("adminId");
    const userType = localStorage.getItem("userType") as "tutor" | "admin" | null;

    setAuthState({
      tutorId,
      adminId,
      userType,
      isLoggedIn: !!(tutorId || adminId),
      isTutor: !!tutorId && userType === "tutor",
      isAdmin: !!adminId && userType === "admin",
    });
  }, []);

  // Refresh auth state on mount and pathname change
  useEffect(() => {
    refreshAuth();
  }, [pathname, refreshAuth]);

  // Also listen for storage events (for multi-tab support)
  useEffect(() => {
    const handleStorageChange = () => {
      refreshAuth();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [refreshAuth]);

  const setTutorAuth = useCallback((tutorId: string) => {
    localStorage.setItem("tutorId", tutorId);
    localStorage.setItem("userType", "tutor");
    localStorage.removeItem("adminId");
    refreshAuth();
  }, [refreshAuth]);

  const setAdminAuth = useCallback((adminId: string) => {
    localStorage.setItem("adminId", adminId);
    localStorage.setItem("userType", "admin");
    localStorage.removeItem("tutorId");
    refreshAuth();
  }, [refreshAuth]);

  const clearAuth = useCallback(() => {
    localStorage.removeItem("tutorId");
    localStorage.removeItem("adminId");
    localStorage.removeItem("userType");
    refreshAuth();
  }, [refreshAuth]);

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        setTutorAuth,
        setAdminAuth,
        clearAuth,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
