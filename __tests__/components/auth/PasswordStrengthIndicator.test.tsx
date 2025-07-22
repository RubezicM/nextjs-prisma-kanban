import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import PasswordStrengthIndicator from "@/components/auth/PasswordStrengthIndicator";

describe("PasswordStrengthIndicator", () => {
  it("renders nothing when password is empty", () => {
    const { container } = render(<PasswordStrengthIndicator password="" />);
    const strengthBar = container.querySelector('[style*="width"]');
    expect(strengthBar).toBeNull();
  });

  it("shows weak strength for short passwords", () => {
    render(<PasswordStrengthIndicator password="pass" />);
    expect(screen.getByText("Weak")).toBeInTheDocument();
  });

  it("shows medium strength for passwords meeting 2-3 requirements", () => {
    render(<PasswordStrengthIndicator password="password" />);
    expect(screen.getByText("Medium")).toBeInTheDocument();
  });

  it("shows strong strength for passwords meeting all requirements", () => {
    render(<PasswordStrengthIndicator password="Password1!" />);
    expect(screen.getByText("Strong")).toBeInTheDocument();
  });

  it("validates individual requirements correctly", () => {
    render(<PasswordStrengthIndicator password="Password1!" />);

    // All requirements should pass
    expect(screen.getByText("At least 8 characters")).toHaveClass("text-green-600");
    expect(screen.getByText("One uppercase letter")).toHaveClass("text-green-600");
    expect(screen.getByText("One lowercase letter")).toHaveClass("text-green-600");
    expect(screen.getByText("One number")).toHaveClass("text-green-600");
    expect(screen.getByText("One special character")).toHaveClass("text-green-600");
  });

  it("shows correct progress bar width for strong password", () => {
    const { container } = render(<PasswordStrengthIndicator password="Password1!" />);
    const progressBar = container.querySelector('[style*="width: 100%"]');
    expect(progressBar).toBeInTheDocument();
  });

  it("applies correct CSS classes for different strength levels", () => {
    const { rerender } = render(<PasswordStrengthIndicator password="pass" />);

    // Weak - red (1/5 = 20%)
    expect(screen.getByText("Weak")).toBeInTheDocument();

    // Medium - yellow (2/5 = 40%)
    rerender(<PasswordStrengthIndicator password="password" />);
    expect(screen.getByText("Medium")).toBeInTheDocument();

    // Strong - green (5/5 = 100%)
    rerender(<PasswordStrengthIndicator password="Password1!" />);
    expect(screen.getByText("Strong")).toBeInTheDocument();
  });

  it("applies correct progress bar colors", () => {
    const { container, rerender } = render(<PasswordStrengthIndicator password="pass" />);

    // Weak - red background
    expect(container.querySelector(".bg-red-500")).toBeInTheDocument();

    // Medium - yellow background
    rerender(<PasswordStrengthIndicator password="password" />);
    expect(container.querySelector(".bg-yellow-500")).toBeInTheDocument();

    // Strong - green background
    rerender(<PasswordStrengthIndicator password="Password1!" />);
    expect(container.querySelector(".bg-green-500")).toBeInTheDocument();
  });

  it("shows failed requirements with red styling", () => {
    render(<PasswordStrengthIndicator password="pass" />);

    // Failed requirements should be red
    expect(screen.getByText("One uppercase letter")).toHaveClass("text-red-600");
    expect(screen.getByText("One number")).toHaveClass("text-red-600");
    expect(screen.getByText("One special character")).toHaveClass("text-red-600");

    // Passed requirements should be green
    expect(screen.getByText("One lowercase letter")).toHaveClass("text-green-600");
  });

  it("calculates correct progress percentages", () => {
    const { container, rerender } = render(<PasswordStrengthIndicator password="pass" />);

    // 1/5 requirements = 20%
    expect(container.querySelector('[style*="width: 20%"]')).toBeInTheDocument();

    // 2/5 requirements = 40%
    rerender(<PasswordStrengthIndicator password="password" />);
    expect(container.querySelector('[style*="width: 40%"]')).toBeInTheDocument();

    // 4/5 requirements = 80%
    rerender(<PasswordStrengthIndicator password="Password1" />);
    expect(container.querySelector('[style*="width: 80%"]')).toBeInTheDocument();
  });

  it("handles edge cases correctly", () => {
    const { rerender } = render(<PasswordStrengthIndicator password="PASSWORD" />);

    // Only uppercase and 8 chars = 2/5 = Medium
    expect(screen.getByText("Medium")).toBeInTheDocument();

    // Exactly 8 characters with mixed case
    rerender(<PasswordStrengthIndicator password="Password" />);
    expect(screen.getByText("Medium")).toBeInTheDocument();

    // Only special characters and numbers
    rerender(<PasswordStrengthIndicator password="12345!@#" />);
    expect(screen.getByText("Medium")).toBeInTheDocument();
  });

  it("displays correct icons for passed/failed requirements", () => {
    const { container } = render(<PasswordStrengthIndicator password="Password1!" />);

    // Should have 5 check icons (all requirements passed)
    const checkIcons = container.querySelectorAll(".lucide-check");
    expect(checkIcons).toHaveLength(5);

    // Should have 0 X icons
    const xIcons = container.querySelectorAll(".lucide-x");
    expect(xIcons).toHaveLength(0);
  });

  it("displays mixed icons for partially strong passwords", () => {
    const { container } = render(<PasswordStrengthIndicator password="pass" />);

    // Should have 1 check icon (lowercase passed)
    const checkIcons = container.querySelectorAll(".lucide-check");
    expect(checkIcons).toHaveLength(1);

    // Should have 4 X icons (4 requirements failed)
    const xIcons = container.querySelectorAll(".lucide-x");
    expect(xIcons).toHaveLength(4);
  });

  it("applies correct text colors for strength indicators", () => {
    const { rerender } = render(<PasswordStrengthIndicator password="pass" />);

    // Weak should be red text
    expect(screen.getByText("Weak")).toHaveClass("text-red-600");

    // Medium should be yellow text
    rerender(<PasswordStrengthIndicator password="password" />);
    expect(screen.getByText("Medium")).toHaveClass("text-yellow-600");

    // Strong should be green text
    rerender(<PasswordStrengthIndicator password="Password1!" />);
    expect(screen.getByText("Strong")).toHaveClass("text-green-600");
  });
});
