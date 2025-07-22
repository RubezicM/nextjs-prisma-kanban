import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import PasswordMatchIndicator from "@/components/auth/PasswordMatchIndicator";

describe("PasswordMatchIndicator", () => {
  it("renders nothing when confirmPassword is empty", () => {
    const { container } = render(
      <PasswordMatchIndicator password="password123" confirmPassword="" />
    );
    expect(container.firstChild).toBeNull();
  });

  it("shows success message when passwords match", () => {
    render(<PasswordMatchIndicator password="password123" confirmPassword="password123" />);
    expect(screen.getByText("Passwords match")).toBeInTheDocument();
  });

  it("shows error message when passwords don't match", () => {
    render(<PasswordMatchIndicator password="password123" confirmPassword="different" />);
    expect(screen.getByText("Passwords don't match")).toBeInTheDocument();
  });

  it("applies correct CSS classes for matching passwords", () => {
    render(<PasswordMatchIndicator password="test123" confirmPassword="test123" />);

    const message = screen.getByText("Passwords match");
    expect(message).toHaveClass("text-green-600");
  });

  it("applies correct CSS classes for non-matching passwords", () => {
    render(<PasswordMatchIndicator password="test123" confirmPassword="different" />);

    const message = screen.getByText("Passwords don't match");
    expect(message).toHaveClass("text-red-600");
  });

  it("displays check icon when passwords match", () => {
    const { container } = render(
      <PasswordMatchIndicator password="test123" confirmPassword="test123" />
    );

    const checkIcon = container.querySelector(".lucide-check");
    expect(checkIcon).toBeInTheDocument();
    expect(checkIcon).toHaveClass("text-green-500");
  });

  it("displays X icon when passwords don't match", () => {
    const { container } = render(
      <PasswordMatchIndicator password="test123" confirmPassword="different" />
    );

    const xIcon = container.querySelector(".lucide-x");
    expect(xIcon).toBeInTheDocument();
    expect(xIcon).toHaveClass("text-red-500");
  });

  it("renders nothing when both passwords are empty", () => {
    const { container } = render(<PasswordMatchIndicator password="" confirmPassword="" />);
    expect(container.firstChild).toBeNull();
  });

  it("shows match when both passwords are the same non-empty string", () => {
    render(<PasswordMatchIndicator password="a" confirmPassword="a" />);
    expect(screen.getByText("Passwords match")).toBeInTheDocument();
  });

  it("handles whitespace differences", () => {
    render(<PasswordMatchIndicator password="password" confirmPassword="password " />);
    expect(screen.getByText("Passwords don't match")).toBeInTheDocument();
  });

  it("handles special characters correctly", () => {
    const specialPassword = "p@ssw0rd!#$%";
    render(<PasswordMatchIndicator password={specialPassword} confirmPassword={specialPassword} />);
    expect(screen.getByText("Passwords match")).toBeInTheDocument();
  });

  it("is case sensitive", () => {
    render(<PasswordMatchIndicator password="Password123" confirmPassword="password123" />);
    expect(screen.getByText("Passwords don't match")).toBeInTheDocument();
  });

  it("updates correctly when passwords change from matching to non-matching", () => {
    const { rerender } = render(
      <PasswordMatchIndicator password="test123" confirmPassword="test123" />
    );

    // Initially matching
    expect(screen.getByText("Passwords match")).toBeInTheDocument();

    // Change to non-matching
    rerender(<PasswordMatchIndicator password="test123" confirmPassword="different" />);
    expect(screen.getByText("Passwords don't match")).toBeInTheDocument();
  });

  it("updates correctly when passwords change from non-matching to matching", () => {
    const { rerender } = render(
      <PasswordMatchIndicator password="test123" confirmPassword="different" />
    );

    // Initially non-matching
    expect(screen.getByText("Passwords don't match")).toBeInTheDocument();

    // Change to matching
    rerender(<PasswordMatchIndicator password="test123" confirmPassword="test123" />);
    expect(screen.getByText("Passwords match")).toBeInTheDocument();
  });

  it("applies correct container styling", () => {
    const { container } = render(<PasswordMatchIndicator password="test" confirmPassword="test" />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("flex", "items-center", "gap-2", "mt-1", "text-xs");
  });
});
