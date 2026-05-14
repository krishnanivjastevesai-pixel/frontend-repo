"use client";

import type { Conversation, Message, PaginatedMessages, Profile } from "@/types/api";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

// Simple cache implementation
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

function getCacheKey(path: string, params?: Record<string, any>): string {
  return `${path}${params ? `?${new URLSearchParams(params).toString()}` : ''}`;
}

function getFromCache<T>(key: string): T | null {
  const cached = cache.get(key);
  if (!cached) return null;
  
  if (Date.now() > cached.timestamp + cached.ttl) {
    cache.delete(key);
    return null;
  }
  
  return cached.data;
}

function setCache<T>(key: string, data: T, ttlMs: number = 30000): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlMs
  });
}

function getChatUser(): string {
  const username = sessionStorage.getItem("ephemeral-chat:username");
  if (!username) {
    throw new ApiError(401, "You need to select a name first", "missing_chat_user");
  }
  return username;
}

async function apiRequest<T>(path: string, init: RequestInit = {}, cacheTtl?: number): Promise<T> {
  const chatUser = getChatUser();
  const headers = new Headers(init.headers);

  headers.set("x-chat-user", chatUser);

  if (!(init.body instanceof FormData) && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  // Check cache for GET requests
  if ((!init.method || init.method === 'GET') && cacheTtl) {
    const cacheKey = getCacheKey(path, init.body ? JSON.parse(init.body as string) : undefined);
    const cached = getFromCache<T>(cacheKey);
    if (cached) return cached;
  }

  const url = `${apiBaseUrl.replace(/\/$/, '')}${path}`;
  
  // Add a timeout to prevent infinite loading states in production
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

  try {
    console.log(`[API] Fetching: ${url}`);
    const response = await fetch(url, {
      ...init,
      headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      const errorMsg = payload?.error?.message ?? `Request failed with status ${response.status}`;
      console.error(`[API] Error ${response.status}: ${url}`, errorMsg);
      throw new ApiError(
        response.status,
        errorMsg,
        payload?.error?.code
      );
    }

    const data = await response.json() as T;

    // Cache successful GET requests
    if ((!init.method || init.method === 'GET') && cacheTtl) {
      const cacheKey = getCacheKey(path, init.body ? JSON.parse(init.body as string) : undefined);
      setCache(cacheKey, data, cacheTtl);
    }

    return data;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      console.error(`[API] Timeout: ${url} (15s)`);
      throw new ApiError(504, "Server is taking too long to respond. It might be waking up from sleep.", "timeout");
    }
    console.error(`[API] Request Failed: ${url}`, err);
    throw err;
  }
}

export async function getMe(): Promise<{ profile: Profile }> {
  return apiRequest("/me", {}, 60000); // Cache for 1 minute
}

export async function getConversations(): Promise<{ items: Conversation[] }> {
  return apiRequest("/conversations", {}, 30000); // Cache for 30 seconds
}

export async function getSingleConversation(): Promise<{ conversation: Conversation }> {
  return apiRequest("/conversations/single", {}, 30000); // Cache for 30 seconds
}

export async function getMessages(
  conversationId: string,
  cursor?: string,
  options?: { bypassCache?: boolean }
): Promise<PaginatedMessages> {
  const params = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  const cacheTtl = options?.bypassCache ? undefined : 10000;
  return apiRequest(`/conversations/${conversationId}/messages${params}`, {}, cacheTtl);
}

export async function createMessage(
  conversationId: string,
  input: { text?: string; image?: File | null }
): Promise<{ message: Message }> {
  const form = new FormData();
  const text = input.text?.trim();

  if (text) {
    form.append("text", text);
  }

  if (input.image) {
    form.append("image", input.image);
  }

  // Clear relevant caches when creating a message
  const messageCachePattern = `/conversations/${conversationId}/messages`;
  for (const [key] of cache) {
    if (key.startsWith(messageCachePattern)) {
      cache.delete(key);
    }
  }

  return apiRequest(`/conversations/${conversationId}/messages`, {
    method: "POST",
    body: form
  });
}
