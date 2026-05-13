"use client";

import type { Conversation } from "@/types/api";

export function StartConversationForm({
  onCreated
}: {
  onCreated: (conversation: Conversation) => void;
}) {
  // No longer needed with auto-selection logic
  // The single conversation is automatically loaded
  return null;
}
