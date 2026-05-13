import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthForm } from "../AuthForm";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace })
}));

describe("AuthForm", () => {
  beforeEach(() => {
    replace.mockReset();
  });

  it.each(["login", "signup"] as const)("redirects to /login from %s mode", async (mode) => {
    render(<AuthForm mode={mode} />);

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/login");
    });
  });
});
