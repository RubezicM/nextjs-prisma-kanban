import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock console methods to reduce verbose output during tests
// Store original methods for tests that need to verify console output
const originalConsoleError = console.error;
const originalConsoleLog = console.log;

// Create silent mock functions
const mockConsoleError = vi.fn();
const mockConsoleLog = vi.fn();

// Override console methods globally for tests
console.error = mockConsoleError;
console.log = mockConsoleLog;

// Export utilities for tests that need to verify console calls or restore original behavior
// Usage example:
// import { testConsole } from "../../../vitest.setup";
//
// it("should log errors when something fails", () => {
//   // Your test code that triggers console.error
//   expect(testConsole.error).toHaveBeenCalledWith("Expected error message");
// });
export const testConsole = {
  error: mockConsoleError,
  log: mockConsoleLog,
  restoreConsoleError: () => {
    console.error = originalConsoleError;
  },
  restoreConsoleLog: () => {
    console.log = originalConsoleLog;
  },
  mockConsoleError: () => {
    console.error = mockConsoleError;
  },
  mockConsoleLog: () => {
    console.log = mockConsoleLog;
  },
};
