"use client";

import { Check, CheckCheck, Clock } from "lucide-react";
import type { Message } from "@/types/api";

function StatusTicks({
  mine,
  status,
  variant = "inline"
}: {
  mine: boolean;
  status?: Message["status"];
  variant?: "inline" | "onMedia";
}) {
  if (!mine) return null;

  const Icon = status === "sending" ? Clock : status === "sent" ? Check : CheckCheck;

  const tone =
    variant === "onMedia"
      ? "text-white/90 drop-shadow-sm"
      : mine
        ? "text-white/70"
        : "text-muted/50";

  return (
    <span
      className={`inline-flex shrink-0 select-none items-center justify-center self-end ${tone}`}
      aria-hidden="true"
    >
      <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={3} />
    </span>
  );
}

export function MessageBubble({
  currentUserId,
  message
}: {
  currentUserId: string;
  message: Message;
}) {
  const mine = message.senderId === currentUserId;
  const hasText = Boolean(message.text?.trim());
  const hasImage = Boolean(message.image);

  return (
    <article
      className={`animate-message-in flex w-full min-w-0 ${mine ? "justify-end" : "justify-start"} px-2 py-1 sm:px-4`}
    >
      <div
        className={`relative w-fit max-w-[85%] rounded-bubble px-4 py-2.5 shadow-bubble sm:max-w-[75%] sm:px-5 sm:py-3 ${
          mine 
            ? "bg-fern text-white rounded-br-none" 
            : "bg-surface border border-border text-ink rounded-bl-none"
        }`}
      >
        {message.image ? (
          <div className="relative mb-2 overflow-hidden rounded-2xl">
            <img
              alt="Message attachment"
              className="max-h-[300px] w-full max-w-full object-cover transition-transform duration-500 hover:scale-105 sm:max-h-[400px]"
              src={message.image.secureUrl}
            />
            {mine && !hasText ? (
              <span className="pointer-events-none absolute bottom-2 right-2 rounded-full bg-black/20 p-1 backdrop-blur-md">
                <StatusTicks mine={mine} status={message.status} variant="onMedia" />
              </span>
            ) : null}
          </div>
        ) : null}

        {hasText ? (
          <div
            className={`flex min-w-0 items-end gap-2.5`}
          >
            <p className="min-w-0 flex-1 whitespace-pre-wrap break-words text-[15px] leading-relaxed sm:text-base">
              {message.text}
            </p>
            <StatusTicks mine={mine} status={message.status} />
          </div>
        ) : null}
      </div>
    </article>
  );
}
