export type Profile = {
  id: string;
  username: "krishna" | "sibbu";
  displayName: string;
};

export type ImageRecord = {
  id: string;
  publicId: string;
  secureUrl: string;
  width: number | null;
  height: number | null;
  format: string | null;
  bytes: number | null;
  expiresAt: string;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  text: string | null;
  image: ImageRecord | null;
  createdAt: string;
  expiresAt: string;
  status?: "sending" | "sent" | "delivered";
};

export type Conversation = {
  id: string;
  otherUser: Profile;
  createdAt: string;
  updatedAt: string;
  lastMessage: {
    id: string;
    text: string | null;
    senderId: string;
    createdAt: string;
    expiresAt: string;
  } | null;
};

export type PaginatedMessages = {
  items: Message[];
  nextCursor: string | null;
};
