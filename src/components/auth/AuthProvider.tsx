"use client";

import type { Profile } from "@/types/api";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type AuthContextValue = {
  profile: Profile | null;
  loading: boolean;
  signIn: (username: "krishna" | "sibbu") => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const PROFILES: Record<string, Profile> = {
  krishna: {
    id: "00000000-0000-4000-8000-000000000001",
    username: "krishna",
    displayName: "Krishna"
  },
  sibbu: {
    id: "00000000-0000-4000-8000-000000000002",
    username: "sibbu",
    displayName: "Sibbu"
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const signIn = useCallback((username: "krishna" | "sibbu") => {
    // Store in sessionStorage (clears on browser close) instead of localStorage
    // This ensures users need to re-authenticate each session
    sessionStorage.setItem("ephemeral-chat:username", username);
    sessionStorage.setItem("ephemeral-chat:login-time", new Date().toISOString());
    setProfile(PROFILES[username]);
  }, []);

  const signOut = useCallback(() => {
    sessionStorage.removeItem("ephemeral-chat:username");
    sessionStorage.removeItem("ephemeral-chat:login-time");
    localStorage.setItem("ephemeral-chat:logout-time", new Date().toISOString());
    setProfile(null);
  }, []);

  useEffect(() => {
    // Check for existing session (only valid for current browser session)
    const storedUsername = sessionStorage.getItem("ephemeral-chat:username");
    const loginTime = sessionStorage.getItem("ephemeral-chat:login-time");
    
    // Optional: Add session timeout (e.g., 1 hour)
    if (storedUsername && loginTime && (storedUsername === "krishna" || storedUsername === "sibbu")) {
      const loginDate = new Date(loginTime);
      const now = new Date();
      const sessionDuration = now.getTime() - loginDate.getTime();
      const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
      
      if (sessionDuration < oneHour) {
        setProfile(PROFILES[storedUsername]);
      } else {
        // Session expired, clear it
        sessionStorage.removeItem("ephemeral-chat:username");
        sessionStorage.removeItem("ephemeral-chat:login-time");
      }
    }
    setLoading(false);
  }, []);

  const value = useMemo(
    () => ({ profile, loading, signIn, signOut }),
    [profile, loading, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}