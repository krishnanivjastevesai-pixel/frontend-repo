import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StartConversationForm } from "../StartConversationForm";

describe("StartConversationForm", () => {
  it("renders nothing and does not call onCreated (conversation is auto-selected)", () => {
    const onCreated = vi.fn();
    const { container } = render(<StartConversationForm onCreated={onCreated} />);

    expect(container.textContent).toBe("");
    expect(onCreated).not.toHaveBeenCalled();
  });
});
