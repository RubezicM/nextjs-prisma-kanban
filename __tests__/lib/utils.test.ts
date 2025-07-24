import { describe, it, expect } from "vitest";

import { generateSlug } from "@/lib/utils";

describe("generateSlug", () => {
  it("generates basic slug from simple title", () => {
    expect(generateSlug("My Project")).toBe("my-project");
  });

  it("handles multiple spaces by replacing with single dash", () => {
    expect(generateSlug("My   Amazing    Project")).toBe("my-amazing-project");
  });

  it("removes special characters", () => {
    expect(generateSlug("My Project! @#$%^&*()")).toBe("my-project");
  });

  it("trims whitespace from beginning and end", () => {
    expect(generateSlug("  My Project  ")).toBe("my-project");
  });

  it("does not end with dash when title ends with spaces", () => {
    expect(generateSlug("My Project ")).toBe("my-project");
  });

  it("does not start with dash when title starts with special chars", () => {
    expect(generateSlug("!@# My Project")).toBe("my-project");
  });

  it("handles title with only special characters", () => {
    expect(generateSlug("!@#$%^&*()")).toBe("");
  });

  it("preserves existing dashes in title", () => {
    expect(generateSlug("My-Project-Name")).toBe("my-project-name");
  });

  it("truncates to 40 characters", () => {
    const longTitle = "This is a very long project title that exceeds forty characters";
    const result = generateSlug(longTitle);
    expect(result.length).toBeLessThanOrEqual(40);
    expect(result).toBe("this-is-a-very-long-project-title-that-e");
  });

  it("removes trailing dash after truncation", () => {
    const titleThatEndsWithDash = "This is a very long project title that-";
    const result = generateSlug(titleThatEndsWithDash);
    expect(result).not.toMatch(/-$/);
  });

  it("handles empty string", () => {
    expect(generateSlug("")).toBe("");
  });

  it("handles numbers in title", () => {
    expect(generateSlug("Project 2024 Version 1")).toBe("project-2024-version-1");
  });

  it("removes consecutive dashes", () => {
    expect(generateSlug("My -- Project")).toBe("my-project");
  });

  it("handles mixed case", () => {
    expect(generateSlug("MyPROJECTname")).toBe("myprojectname");
  });

  it("handles title with only spaces", () => {
    expect(generateSlug("   ")).toBe("");
  });

  it("handles unicode characters by removing them", () => {
    expect(generateSlug("My Project 🚀 ñáéíóú")).toBe("my-project");
  });
});
