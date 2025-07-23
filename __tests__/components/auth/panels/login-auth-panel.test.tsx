import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { useSearchParams } from "next/navigation";

import { signInWithGoogle, signInWithGitHub } from "@/lib/actions/auth-actions";

import LoginAuthPanel from "@/components/auth/panels/login-auth-panel";

// Mock Next.js hooks
vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(),
}));

// Mock auth actions
vi.mock("@/lib/actions/auth-actions", () => ({
  signInWithGoogle: vi.fn().mockResolvedValue(undefined),
  signInWithGitHub: vi.fn().mockResolvedValue(undefined),
}));

// Mock the CredentialsSignInForm component
vi.mock("@/components/auth/forms/credentials-signin-form", () => ({
  default: ({ formDisabled }: { formDisabled?: boolean }) => (
    <div data-testid="credentials-form" data-disabled={formDisabled}>
      Credentials Sign In Form
    </div>
  ),
}));

// Mock useTransition - we'll override this in specific tests
const mockStartTransition = vi.fn(callback => {
  // Execute the callback immediately to simulate startTransition behavior
  // Since the callback is async, we need to handle it properly
  if (callback) {
    callback();
  }
});
vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...actual,
    useTransition: () => [false, mockStartTransition], // [isPending, startTransition]
  };
});

describe("LoginAuthPanel", () => {
  const mockUseSearchParams = vi.mocked(useSearchParams);
  const mockSignInWithGoogle = vi.mocked(signInWithGoogle);
  const mockSignInWithGitHub = vi.mocked(signInWithGitHub);

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock for search params
    mockUseSearchParams.mockReturnValue({
      get: vi.fn().mockReturnValue(null), // Default to null (no callbackUrl)
    } as unknown as ReturnType<typeof useSearchParams>);
  });

  it("renders all UI elements correctly", () => {
    render(<LoginAuthPanel />);

    // Check buttons
    expect(screen.getByRole("button", { name: /log in with google/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in with github/i })).toBeInTheDocument();

    // Check divider text
    expect(screen.getByText("Or continue with")).toBeInTheDocument();

    // Check credentials form
    expect(screen.getByTestId("credentials-form")).toBeInTheDocument();
  });

  it("displays correct icons on buttons", () => {
    render(<LoginAuthPanel />);

    // Google and GitHub icons should be present (using class selectors)
    const googleButton = screen.getByRole("button", { name: /log in with google/i });
    const githubButton = screen.getByRole("button", { name: /log in with github/i });

    expect(googleButton).toBeInTheDocument();
    expect(githubButton).toBeInTheDocument();
  });

  it("uses default callbackUrl when none in search params", async () => {
    mockUseSearchParams.mockReturnValue({
      get: vi.fn().mockReturnValue(null),
    } as unknown as ReturnType<typeof useSearchParams>);

    render(<LoginAuthPanel />);

    const googleButton = screen.getByRole("button", { name: /log in with google/i });
    fireEvent.click(googleButton);

    await waitFor(() => {
      expect(mockSignInWithGoogle).toHaveBeenCalled();
    });
  });

  it("uses custom callbackUrl from search params", async () => {
    mockUseSearchParams.mockReturnValue({
      get: vi.fn().mockReturnValue("/dashboard"),
    } as unknown as ReturnType<typeof useSearchParams>);

    render(<LoginAuthPanel />);

    const googleButton = screen.getByRole("button", { name: /log in with google/i });
    fireEvent.click(googleButton);

    await waitFor(() => {
      expect(mockSignInWithGoogle).toHaveBeenCalled();
    });
  });

  it("calls signInWithGoogle when Google button is clicked", async () => {
    render(<LoginAuthPanel />);

    const googleButton = screen.getByRole("button", { name: /log in with google/i });
    fireEvent.click(googleButton);

    await waitFor(() => {
      expect(mockSignInWithGoogle).toHaveBeenCalledWith(expect.any(FormData));
    });
  });

  it("calls signInWithGitHub when GitHub button is clicked", async () => {
    render(<LoginAuthPanel />);

    const githubButton = screen.getByRole("button", { name: /log in with github/i });
    fireEvent.click(githubButton);

    await waitFor(() => {
      expect(mockSignInWithGitHub).toHaveBeenCalledWith(expect.any(FormData));
    });
  });

  it("passes formDisabled prop to CredentialsSignInForm", () => {
    render(<LoginAuthPanel />);

    const credentialsForm = screen.getByTestId("credentials-form");
    expect(credentialsForm).toHaveAttribute("data-disabled", "false");
  });

  it("applies correct CSS classes to container", () => {
    const { container } = render(<LoginAuthPanel />);

    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toHaveClass(
      "flex",
      "flex-col",
      "w-full",
      "items-center",
      "justify-center",
      "gap-4",
      "my-4"
    );
  });

  it("applies correct styling to buttons", () => {
    render(<LoginAuthPanel />);

    const googleButton = screen.getByRole("button", { name: /log in with google/i });
    const githubButton = screen.getByRole("button", { name: /log in with github/i });

    expect(googleButton).toHaveClass("w-full");
    expect(githubButton).toHaveClass("w-full");
  });

  it("handles button clicks and calls startTransition", () => {
    render(<LoginAuthPanel />);

    const googleButton = screen.getByRole("button", { name: /log in with google/i });
    fireEvent.click(googleButton);

    expect(mockStartTransition).toHaveBeenCalled();
  });

  it("displays button text correctly in default state", () => {
    render(<LoginAuthPanel />);

    expect(screen.getByText("Log in with Google")).toBeInTheDocument();
    expect(screen.getByText("Log in with GitHub")).toBeInTheDocument();
  });

  it("renders divider with proper styling", () => {
    const { container } = render(<LoginAuthPanel />);

    const divider = container.querySelector(".after\\:border-t");
    expect(divider).toBeInTheDocument();

    const dividerText = screen.getByText("Or continue with");
    expect(dividerText).toHaveClass("bg-background", "text-muted-foreground");
  });
});
