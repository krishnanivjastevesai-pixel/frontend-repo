// Socket.IO event types for type-safe communication

export interface ServerToClientEvents {
  // Message events
  "message:new": (message: {
    id: string;
    conversationId: string;
    senderId: string;
    text: string | null;
    image: {
      id: string;
      secureUrl: string;
      width: number | null;
      height: number | null;
    } | null;
    createdAt: string;
    expiresAt: string;
  }) => void;

  "message:delivered": (data: { messageId: string; deliveredAt: string }) => void;

  // Typing events
  "typing:start": (data: { userId: string; username: string }) => void;
  "typing:stop": (data: { userId: string }) => void;

  // User presence
  "user:online": (data: { userId: string; username: string }) => void;
  "user:offline": (data: { userId: string }) => void;

  // Connection events
  "connection:success": (data: { userId: string; socketId: string }) => void;
  "error": (data: { message: string; code?: string }) => void;
}

export interface ClientToServerEvents {
  // Message events
  "message:send": (data: {
    conversationId: string;
    text?: string;
    tempId: string;
  }, callback: (response: { success: boolean; messageId?: string; error?: string }) => void) => void;

  // Typing events
  "typing:start": (data: { conversationId: string }) => void;
  "typing:stop": (data: { conversationId: string }) => void;

  // Room management
  "conversation:join": (conversationId: string) => void;
  "conversation:leave": (conversationId: string) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string;
  username: string;
  conversationId?: string;
}
