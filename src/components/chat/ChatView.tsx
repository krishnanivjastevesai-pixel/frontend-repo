"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  memo
} from "react";
import { ArrowLeft, Loader2, MessageSquareText } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSocket } from "@/components/chat/SocketProvider";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { MessageComposer } from "@/components/chat/MessageComposer";
import { ApiError, createMessage, getMessages } from "@/lib/api";
import type { Conversation, Message } from "@/types/api";

const NEAR_BOTTOM_PX = 160;

function snapshotMessages(items: Message[]) {
  if (items.length === 0) return "0:";
  const last = items[items.length - 1];
  return `${items.length}:${last?.id ?? ""}:${last?.createdAt ?? ""}`;
}

// Memoized message list component
const MessageList = memo(
  ({
    messages,
    currentUserId
  }: {
    messages: Message[];
    currentUserId: string;
  }) => (
    <>
      {messages.map((message) => (
        <MessageBubble
          currentUserId={currentUserId}
          key={message.id}
          message={message}
        />
      ))}
    </>
  )
);

MessageList.displayName = "MessageList";

export function ChatView({
  conversation,
  conversationId,
  onMessageSent
}: {
  conversation: Conversation | null;
  conversationId: string;
  onMessageSent: () => void;
}) {
  const { profile } = useAuth();
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [isOtherUserOnline, setIsOtherUserOnline] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const nearBottomRef = useRef(true);
  const sendingRef = useRef(false);
  const lastSnapshotRef = useRef("");
  const activeConversationIdRef = useRef(conversationId);

  const title = useMemo(
    () => conversation?.otherUser.displayName ?? "Conversation",
    [conversation]
  );

  useEffect(() => {
    sendingRef.current = sending;
  }, [sending]);

  useEffect(() => {
    activeConversationIdRef.current = conversationId;
  }, [conversationId]);

  const updateNearBottom = useCallback(() => {
    const el = scrollAreaRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    nearBottomRef.current = distance <= NEAR_BOTTOM_PX;
  }, []);

  const loadMessages = useCallback(
    async (mode: "initial" | "refresh") => {
      const cid = conversationId;
      if (mode === "refresh" && sendingRef.current) {
        return;
      }

      if (mode === "initial") {
        setLoading(true);
      }
      setError(null);

      try {
        const response = await getMessages(cid, undefined, {
          bypassCache: true
        });

        if (activeConversationIdRef.current !== cid) {
          return;
        }

        const snap = snapshotMessages(response.items);
        if (mode === "refresh" && snap === lastSnapshotRef.current) {
          return;
        }
        lastSnapshotRef.current = snap;
        setMessages(response.items);
      } catch (caught) {
        if (activeConversationIdRef.current !== cid) {
          return;
        }
        setError(
          caught instanceof ApiError ? caught.message : "Unable to load messages"
        );
      } finally {
        if (activeConversationIdRef.current === cid) {
          setLoading(false);
        }
      }
    },
    [conversationId]
  );

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) {
      return;
    }

    const syncKeyboardInset = () => {
      const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      document.documentElement.style.setProperty(
        "--keyboard-visual-offset",
        `${inset}px`
      );
    };

    vv.addEventListener("resize", syncKeyboardInset);
    vv.addEventListener("scroll", syncKeyboardInset);
    syncKeyboardInset();

    return () => {
      vv.removeEventListener("resize", syncKeyboardInset);
      vv.removeEventListener("scroll", syncKeyboardInset);
      document.documentElement.style.removeProperty("--keyboard-visual-offset");
    };
  }, []);

  useEffect(() => {
    const el = scrollAreaRef.current;
    if (!el) {
      return;
    }

    el.addEventListener("scroll", updateNearBottom, { passive: true });
    updateNearBottom();

    return () => {
      el.removeEventListener("scroll", updateNearBottom);
    };
  }, [conversationId, updateNearBottom, loading]);

  useLayoutEffect(() => {
    if (!nearBottomRef.current) {
      return;
    }
    const scrollEl = scrollAreaRef.current;
    if (!scrollEl) {
      return;
    }
    requestAnimationFrame(() => {
      scrollEl.scrollTop = scrollEl.scrollHeight - scrollEl.clientHeight;
    });
  }, [messages]);

  useEffect(() => {
    setLoading(true);
    setMessages([]);
    lastSnapshotRef.current = "";
    nearBottomRef.current = true;

    void loadMessages("initial");

    if (!socket) return;

    const joinRoom = () => {
      console.log(`[Socket] Joining room: conversation:${conversationId}`);
      socket.emit("conversation:join", conversationId);
    };

    // Join room immediately
    joinRoom();

    // Re-join on reconnection (Critical for real-time to work after connection drops)
    socket.on("connect", joinRoom);

    // Listen for new messages
    socket.on("message:new", (newMessage) => {
      console.log("[Socket] New message received:", newMessage.id);
      setMessages((current) => {
        // 1. If message already exists (by ID), don't add it again
        if (current.some((m) => m.id === newMessage.id)) return current;
        
        // 2. If it's from us, try to find an optimistic message to replace
        if (newMessage.senderId === profile?.id) {
          const optimisticIdx = current.findIndex(
            m => m.status === "sending" && m.text === newMessage.text && m.id.startsWith("temp-")
          );
          
          if (optimisticIdx !== -1) {
            const updated = [...current];
            updated[optimisticIdx] = { ...newMessage as Message, status: "delivered" };
            return updated;
          }
        }
        
        // 3. Otherwise, just append it
        return [...current, newMessage as Message];
      });
      nearBottomRef.current = true;
    });

    // Listen for typing events
    socket.on("typing:start", (data) => {
      if (data.userId !== profile?.id) {
        setOtherUserTyping(true);
      }
    });

    socket.on("typing:stop", (data) => {
      if (data.userId !== profile?.id) {
        setOtherUserTyping(false);
      }
    });

    // Listen for user presence
    socket.on("user:online", (data) => {
      if (data.userId !== profile?.id) {
        setIsOtherUserOnline(true);
      }
    });

    socket.on("user:offline", (data) => {
      if (data.userId !== profile?.id) {
        setIsOtherUserOnline(false);
        setOtherUserTyping(false);
      }
    });

    return () => {
      socket.emit("conversation:leave", conversationId);
      socket.off("connect", joinRoom);
      socket.off("message:new");
      socket.off("typing:start");
      socket.off("typing:stop");
      socket.off("user:online");
      socket.off("user:offline");
    };
  }, [conversationId, loadMessages, socket, profile?.id]);

  async function handleSend(input: { text: string; image: File | null }) {
    setSending(true);
    setError(null);

    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      conversationId,
      senderId: profile?.id ?? "",
      text: input.text || null,
      image: null,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: "sending"
    };

    setMessages((current) => [...current, optimisticMessage]);
    nearBottomRef.current = true;

    try {
      if (!input.image && socket && isConnected) {
        // Send text-only message via Socket.IO for instant delivery
        socket.emit("message:send", {
          conversationId,
          text: input.text,
          tempId: optimisticMessage.id
        }, (response) => {
          if (response.success) {
            setMessages((current) =>
              current.map((msg) =>
                msg.id === optimisticMessage.id
                  ? { ...msg, id: response.messageId!, status: "delivered" as const }
                  : msg
              )
            );
          } else {
            setMessages((current) => current.filter((msg) => msg.id !== optimisticMessage.id));
            setError(response.error || "Failed to send message");
          }
          setSending(false);
        });
        
        // Callback handles the rest
        return;
      }

      // Send via REST for images or if socket is disconnected
      const response = await createMessage(conversationId, input);
      setMessages((current) => {
        const mapped = current.map((msg) =>
          msg.id === optimisticMessage.id
            ? { ...response.message, status: "delivered" as const }
            : msg
        );
        lastSnapshotRef.current = snapshotMessages(mapped);
        return mapped;
      });
      onMessageSent();
    } catch (caught) {
      setMessages((current) =>
        current.filter((msg) => msg.id !== optimisticMessage.id)
      );
      setError(
        caught instanceof ApiError ? caught.message : "Unable to send message"
      );
    } finally {
      setSending(false);
    }
  }

  const isTypingRef = useRef(false);

  const handleTyping = useCallback(
    (isTyping: boolean) => {
      if (!socket) return;
      if (isTyping === isTypingRef.current) return;

      isTypingRef.current = isTyping;

      if (isTyping) {
        socket.emit("typing:start", { conversationId });
      } else {
        socket.emit("typing:stop", { conversationId });
      }
    },
    [socket, conversationId]
  );

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-surface/70 px-3 backdrop-blur-md sm:h-16 sm:px-4">
        <Link
          className="grid h-10 w-10 place-items-center rounded-2xl border border-border bg-surface text-ink shadow-soft transition-all hover:bg-mist active:scale-90 md:hidden"
          href="/chat"
          title="Back to conversations"
          aria-label="Back to conversations"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </Link>

        <div className="min-w-0 flex-1">
          <h1 className="flex items-center gap-2 truncate text-base font-bold text-ink sm:text-lg">
            {title}
            <span className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${isOtherUserOnline ? 'bg-fern animate-pulse' : 'bg-muted/30'}`} />
              <span className="hidden text-xs font-medium text-muted sm:inline">
                {isOtherUserOnline ? 'Online' : 'Offline'}
              </span>
            </span>
          </h1>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted/70 sm:text-xs">Active session</p>
        </div>
      </header>

      <div
        ref={scrollAreaRef}
        className="custom-scrollbar flex-1 overflow-y-auto overflow-x-hidden scroll-smooth px-2 py-4 sm:px-4"
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 8px)"
        }}
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-2">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-fern/40" />
            </div>
          ) : error ? (
            <div className="mx-auto my-8 max-w-sm rounded-2xl bg-coral/10 p-4 text-center text-sm text-coral border border-coral/20">
              {error}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center p-8">
              <div className="mb-4 rounded-full bg-fern-light/30 p-4">
                <MessageSquareText className="h-8 w-8 text-fern" />
              </div>
              <p className="text-lg font-bold text-ink">No messages yet</p>
              <p className="text-sm text-muted">Send a message to start the conversation!</p>
            </div>
          ) : (
            <MessageList currentUserId={profile?.id ?? ""} messages={messages} />
          )}

          {otherUserTyping && (
            <div className="animate-message-in flex justify-start px-4 py-2">
              <div className="flex items-center gap-1 rounded-2xl bg-mist border border-border px-4 py-3 shadow-sm">
                <span className="typing-dot h-1.5 w-1.5 rounded-full bg-fern/60" />
                <span className="typing-dot h-1.5 w-1.5 rounded-full bg-fern/60" />
                <span className="typing-dot h-1.5 w-1.5 rounded-full bg-fern/60" />
                <span className="ml-2 text-xs text-muted">
                  {conversation?.otherUser.displayName} is typing...
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 z-10 shrink-0 border-t border-border bg-surface/95 backdrop-blur-md md:relative md:bg-surface/50"
        style={{
          paddingBottom: "max(env(safe-area-inset-bottom, 0px), var(--keyboard-visual-offset, 0px))"
        }}
      >
        <div className="mx-auto w-full max-w-3xl">
          <MessageComposer
            disabled={loading || sending}
            onSend={handleSend}
            onTyping={handleTyping}
          />
        </div>
      </div>
    </div>
  );
}
