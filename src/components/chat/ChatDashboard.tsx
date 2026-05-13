"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth } from "@/components/auth/AuthProvider";
import { AppShell } from "@/components/layout/AppShell";
import { ChatView } from "@/components/chat/ChatView";
import { ApiError, getSingleConversation } from "@/lib/api";
import type { Conversation } from "@/types/api";

export function ChatDashboard({ activeConversationId }: { activeConversationId?: string }) {
  const router = useRouter();
  const { profile } = useAuth();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSingleConversation() {
      if (!profile) return;

      setLoading(true);
      setError(null);

      try {
        const response = await getSingleConversation();
        setConversation(response.conversation);
        
        // Auto-redirect to the single conversation if not already there
        if (!activeConversationId || activeConversationId !== response.conversation.id) {
          router.replace(`/chat/${response.conversation.id}`);
        }
      } catch (caught) {
        setError(caught instanceof ApiError ? caught.message : "Unable to load conversation");
      } finally {
        setLoading(false);
      }
    }

    void loadSingleConversation();
  }, [profile, activeConversationId, router]);

  if (loading) {
    return (
      <RequireAuth>
        <AppShell>
          <div className="flex min-h-0 w-full flex-1 items-center justify-center bg-surface">
            <Loader2 className="h-10 w-10 animate-spin text-fern/40" aria-label="Loading conversation" />
          </div>
        </AppShell>
      </RequireAuth>
    );
  }

  if (error) {
    return (
      <RequireAuth>
        <AppShell>
          <div className="flex min-h-0 w-full flex-1 items-center justify-center bg-surface">
            <div className="text-center p-6 rounded-2xl bg-coral/10 border border-coral/20">
              <p className="text-coral font-medium">{error}</p>
            </div>
          </div>
        </AppShell>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <AppShell>
        <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-surface">
          {conversation && activeConversationId ? (
            <ChatView
              conversation={conversation}
              conversationId={activeConversationId}
              onMessageSent={() => {}} // Single conversation doesn't need reload
            />
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-center">
               <div className="max-w-xs">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-fern-light/50 text-fern">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
                <p className="text-lg font-bold text-ink">Setting up chat...</p>
                <p className="text-sm text-muted">Please wait while we prepare your conversation.</p>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </RequireAuth>
  );
}
