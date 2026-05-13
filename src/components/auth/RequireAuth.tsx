"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "./AuthProvider";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { loading, profile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !profile) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, pathname, router, profile]);

  if (loading || !profile) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-transparent px-6">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-2xl bg-fern/20 animate-ping" />
            <div className="relative flex h-full w-full items-center justify-center rounded-2xl bg-surface shadow-soft">
              <Loader2 className="h-8 w-8 animate-spin text-fern" aria-label="Loading" />
            </div>
          </div>
          <p className="text-sm font-bold tracking-widest text-muted uppercase">Verifying</p>
        </div>
      </main>
    );
  }

  return children;
}
