import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RequireAuth } from "../RequireAuth";

const replace = vi.fn();
const mockUseAuth = vi.fn();
const mockUsePathname = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => mockUsePathname()
}));

vi.mock("../AuthProvider", () => ({
  useAuth: () => mockUseAuth()
}));

describe("RequireAuth", () => {
  beforeEach(() => {
    replace.mockReset();
    mockUseAuth.mockReset();
    mockUsePathname.mockReset();
    mockUsePathname.mockReturnValue("/chat");
  });

  it("shows loading state while session check is in progress", () => {
    mockUseAuth.mockReturnValue({
      loading: true,
      profile: null
    });

    render(
      <RequireAuth>
        <div>private</div>
      </RequireAuth>
    );

    expect(screen.getByLabelText("Loading")).toBeInTheDocument();
  });

  it("redirects unauthenticated users to login", async () => {
    mockUseAuth.mockReturnValue({
      loading: false,
      profile: null
    });

    render(
      <RequireAuth>
        <div>private</div>
      </RequireAuth>
    );

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/login?next=%2Fchat");
    });
  });

  it("renders children for authenticated users", () => {
    mockUseAuth.mockReturnValue({
      loading: false,
      profile: {
        id: "00000000-0000-4000-8000-000000000001",
        username: "krishna",
        displayName: "Krishna"
      }
    });

    render(
      <RequireAuth>
        <div>private</div>
      </RequireAuth>
    );

    expect(screen.getByText("private")).toBeInTheDocument();
  });
});
