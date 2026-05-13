"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth } from "@/components/auth/AuthProvider";
import { AppShell } from "@/components/layout/AppShell";
import { ApiError, getSingleConversation } from "@/lib/api";

export default function ChatPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function redirectToSingleChat() {
      if (!profile) return;

      try {
        const response = await getSingleConversation();
        // Auto-redirect to the single conversation
        router.replace(`/chat/${response.conversation.id}`);
      } catch (caught) {
        console.error("Failed to load conversation:", caught);
        setError(caught instanceof ApiError ? caught.message : "Unable to load chat");
      }
    }

    void redirectToSingleChat();
  }, [profile, router]);

  return (
    <RequireAuth>
      <AppShell>
        <div className="flex min-h-0 w-full flex-1 items-center justify-center bg-surface">
          {error ? (
            <div className="text-center p-6 rounded-2xl bg-coral/10 border border-coral/20 max-w-sm">
              <p className="text-coral font-medium mb-2">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="text-sm font-bold text-coral underline underline-offset-4 hover:text-coral-dark"
              >
                Try again
              </button>
            </div>
          ) : (
            <Loader2 className="h-10 w-10 animate-spin text-fern/40" aria-label="Loading chat" />
          )}
        </div>
      </AppShell>
    </RequireAuth>
  );
}
