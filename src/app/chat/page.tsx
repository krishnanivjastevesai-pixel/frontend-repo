"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth } from "@/components/auth/AuthProvider";
import { AppShell } from "@/components/layout/AppShell";
import { ApiError, getSingleConversation } from "@/lib/api";

export default function ChatPage() {
  const router = useRouter();
  const { profile } = useAuth();

  useEffect(() => {
    async function redirectToSingleChat() {
      if (!profile) return;

      try {
        const response = await getSingleConversation();
        // Auto-redirect to the single conversation
        router.replace(`/chat/${response.conversation.id}`);
      } catch (caught) {
        console.error("Failed to load conversation:", caught);
      }
    }

    void redirectToSingleChat();
  }, [profile, router]);

  return (
    <RequireAuth>
      <AppShell>
        <div className="flex min-h-0 w-full flex-1 items-center justify-center bg-surface">
          <Loader2 className="h-10 w-10 animate-spin text-fern/40" aria-label="Loading chat" />
        </div>
      </AppShell>
    </RequireAuth>
  );
}
