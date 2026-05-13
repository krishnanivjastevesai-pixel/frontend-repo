"use client";

import { useRef, useState, useCallback, useEffect, useLayoutEffect } from "react";
import { ImagePlus, Send, X } from "lucide-react";

export function MessageComposer({
  disabled,
  onSend,
  onTyping
}: {
  disabled: boolean;
  onSend: (input: { text: string; image: File | null }) => Promise<void>;
  onTyping?: (isTyping: boolean) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const canSend = Boolean(text.trim() || image);

  // Debounced typing handler
  const handleTypingChange = useCallback((value: string) => {
    setText(value);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Send typing indicator if there's text
    if (value.length > 0) {
      onTyping?.(true);
      
      // Stop typing indicator after 1 second of no typing
      typingTimeoutRef.current = setTimeout(() => {
        onTyping?.(false);
      }, 1000);
    } else {
      onTyping?.(false);
    }
  }, [onTyping]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const syncTextareaHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) {
      return;
    }
    el.style.height = "0px";
    const max = 144; /* matches max-h-36 */
    el.style.height = `${Math.min(el.scrollHeight, max)}px`;
  }, []);

  useLayoutEffect(() => {
    syncTextareaHeight();
  }, [text, syncTextareaHeight]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSend || disabled) {
      return;
    }

    await onSend({ text, image });
    setText("");
    setImage(null);
    
    // Stop typing indicator when message is sent
    onTyping?.(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <form className="bg-surface/50 p-4 backdrop-blur-md" onSubmit={handleSubmit}>
      {image ? (
        <div className="animate-message-in mb-3 flex items-center justify-between gap-3 rounded-2xl border border-fern/20 bg-fern-light/40 px-4 py-2 text-sm text-ink backdrop-blur-sm">
          <div className="flex min-w-0 items-center gap-2">
            <ImagePlus className="h-4 w-4 text-fern" />
            <span className="min-w-0 truncate font-medium">{image.name}</span>
          </div>
          <button
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/50 text-ink transition-all hover:bg-white hover:text-coral active:scale-90"
            type="button"
            title="Remove image"
            aria-label="Remove image"
            onClick={() => setImage(null)}
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      ) : null}

      <div className="flex items-end gap-2 sm:gap-4">
        <button
          className="grid h-12 w-12 shrink-0 touch-manipulation place-items-center rounded-2xl border border-border bg-surface text-muted shadow-soft transition-all hover:border-fern/50 hover:bg-fern-light/20 hover:text-fern active:scale-90"
          type="button"
          title="Attach image"
          aria-label="Attach image"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImagePlus className="h-5 w-5" aria-hidden="true" />
        </button>

        <input
          ref={fileInputRef}
          className="hidden"
          type="file"
          accept="image/*"
          onChange={(event) => setImage(event.target.files?.[0] ?? null)}
        />

        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            className="custom-scrollbar max-h-36 min-h-[48px] w-full resize-none rounded-2xl border border-border bg-surface px-4 py-3 text-[15px] leading-relaxed text-ink shadow-soft outline-none transition-all focus:border-fern/50 focus:ring-2 focus:ring-fern/10 sm:text-base"
            placeholder="Type a message..."
            rows={1}
            value={text}
            enterKeyHint="send"
            onChange={(event) => handleTypingChange(event.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as any);
              }
            }}
          />
        </div>

        <button
          className="grid h-12 w-12 shrink-0 touch-manipulation place-items-center rounded-2xl bg-fern text-white shadow-soft transition-all hover:bg-fern-dark hover:shadow-lg disabled:cursor-not-allowed disabled:bg-muted/30 disabled:shadow-none active:scale-90"
          type="submit"
          title="Send message"
          aria-label="Send message"
          disabled={disabled || !canSend}
        >
          <Send className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}
