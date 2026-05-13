"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

type AuthMode = "login" | "signup";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new login page
    router.replace("/login");
  }, [router]);

  return null;
}
