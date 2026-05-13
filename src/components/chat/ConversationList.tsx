"use client";

import Link from "next/link";
import { MessageSquareText } from "lucide-react";
import { formatConversationDate } from "@/lib/date";
import type { Conversation } from "@/types/api";

export function ConversationList({
  activeConversationId,
  conversations,
  error
}: {
  activeConversationId?: string;
  conversations: Conversation[];
  error: string | null;
}) {
  if (error) {
    return (
      <div className="p-4">
        <p className="rounded-[8px] bg-coral/10 px-3 py-2 text-sm text-coral" role="alert">
          {error}
        </p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="grid flex-1 place-items-center px-6 text-center">
        <div>
          <MessageSquareText className="mx-auto mb-3 h-9 w-9 text-fern" aria-hidden="true" />
          <p className="font-semibold text-ink">No conversations yet</p>
        </div>
      </div>
    );
  }

  return (
    <nav className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-2 py-2">
      <div className="flex flex-col gap-1">
        {conversations.map((conversation) => {
          const isActive = activeConversationId === conversation.id;
          const label =
            conversation.lastMessage?.text ??
            (conversation.lastMessage ? "📷 Image message" : "No messages yet");

          return (
            <Link
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200 ${
                isActive 
                  ? "bg-fern text-white shadow-soft" 
                  : "bg-surface hover:bg-mist text-ink"
              }`}
              href={`/chat/${conversation.id}`}
              key={conversation.id}
            >
              <div className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl ${isActive ? 'bg-white/20' : 'bg-fern-light/50'}`}>
                <span className={`grid h-full w-full place-items-center text-lg font-bold ${isActive ? 'text-white' : 'text-fern'}`}>
                  {conversation.otherUser.displayName.slice(0, 1).toUpperCase()}
                </span>
                {!isActive && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-surface bg-fern" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className={`truncate text-sm font-bold ${isActive ? 'text-white' : 'text-ink'}`}>
                    {conversation.otherUser.displayName}
                  </span>
                  <span className={`shrink-0 text-[11px] ${isActive ? 'text-white/80' : 'text-muted'}`}>
                    {conversation.lastMessage
                      ? formatConversationDate(conversation.lastMessage.createdAt)
                      : formatConversationDate(conversation.createdAt)}
                  </span>
                </div>
                <p className={`truncate text-[13px] ${isActive ? 'text-white/90' : 'text-muted'}`}>
                  {label}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
