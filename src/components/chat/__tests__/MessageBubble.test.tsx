import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MessageBubble } from "../MessageBubble";
import type { Message } from "@/types/api";

const baseMessage: Message = {
  id: "message-1",
  conversationId: "conversation-1",
  senderId: "user-1",
  text: "hello",
  image: null,
  createdAt: "2026-05-13T10:00:00.000Z",
  expiresAt: "2026-05-20T10:00:00.000Z"
};

describe("MessageBubble", () => {
  it("renders text messages", () => {
    render(<MessageBubble currentUserId="user-1" message={baseMessage} />);

    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("renders image messages", () => {
    render(
      <MessageBubble
        currentUserId="user-2"
        message={{
          ...baseMessage,
          text: null,
          image: {
            id: "image-1",
            publicId: "temporary/image",
            secureUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
            width: 800,
            height: 600,
            format: "jpg",
            bytes: 1234,
            expiresAt: "2026-05-20T10:00:00.000Z"
          }
        }}
      />
    );

    expect(screen.getByRole("img", { name: /message attachment/i })).toHaveAttribute(
      "src",
      expect.stringContaining("cloudinary")
    );
  });
});
