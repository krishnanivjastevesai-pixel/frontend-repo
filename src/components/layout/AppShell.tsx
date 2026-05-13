"use client";

import { LogOut, MessageSquareText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { signOut, profile } = useAuth();
  const router = useRouter();

  // Auto-selection logic: show who the user is chatting with
  const chatPartner = profile?.username === "krishna" ? "Sibbu" : "Krishna";

  function handleSignOut() {
    signOut();
    router.replace("/login");
  }

  return (
    <main className="flex h-[100dvh] max-h-[100dvh] min-h-0 flex-col overflow-hidden bg-background/50">
      <header className="safe-area-pad-top border-b border-border bg-surface/80 px-4 pb-3 backdrop-blur-lg">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-fern text-white shadow-soft">
              <MessageSquareText className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-base font-bold tracking-tight text-ink sm:text-lg">Chat with {chatPartner}</p>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-fern animate-pulse" />
                <p className="truncate text-xs font-medium text-muted sm:text-sm">Online</p>
              </div>
            </div>
          </div>

          <button
            className="grid h-10 w-10 place-items-center rounded-2xl border border-border bg-surface text-ink shadow-soft transition-all hover:border-fern/50 hover:bg-fern-light/30 hover:text-fern active:scale-90"
            type="button"
            title="Sign out"
            aria-label="Sign out"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="safe-area-pad-x mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col px-4 py-4 md:px-6">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-4xl border border-border bg-surface/50 shadow-cute backdrop-blur-sm">
          {children}
        </div>
      </div>
    </main>
  );
}
