import type { Board, BoardWithData, Card } from "@/types/database";
import { vi } from "vitest";

import { LIST_TYPES } from "@/lib/constants/config";

// Mock Prisma client operations
export const mockPrismaClient = {
  board: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
  },
  list: {
    findFirst: vi.fn(),
    createMany: vi.fn(),
  },
  card: {
    createMany: vi.fn(),
  },
  $transaction: vi.fn(),
};

// Mock NextAuth session
export const mockAuthSession = (
  overrides?: Partial<{ user: { id: string; email: string; name: string } }>
) => ({
  user: {
    id: "test-user-id",
    email: "test@example.com",
    name: "Test User",
    ...overrides?.user,
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
});

// Mock Next.js revalidatePath function
export const mockRevalidatePath = vi.fn();

// Common test data factories
export const createMockBoard = (overrides?: Partial<Board>): Board => ({
  id: "board-123",
  title: "Test Board",
  slug: "test-board",
  userId: "test-user-id",
  createdAt: new Date("2024-01-01T10:00:00Z"),
  updatedAt: new Date("2024-01-01T10:00:00Z"),
  ...overrides,
});

export const createMockBoardWithData = (overrides?: Partial<BoardWithData>): BoardWithData => ({
  id: "board-123",
  title: "Test Board",
  slug: "test-board",
  userId: "test-user-id",
  createdAt: new Date("2024-01-01T10:00:00Z"),
  updatedAt: new Date("2024-01-01T10:00:00Z"),
  lists: [
    {
      id: "list-1",
      title: "Backlog",
      type: LIST_TYPES.BACKLOG,
      order: 0,
      collapsed: false,
      createdAt: new Date("2024-01-01T10:00:00Z"),
      updatedAt: new Date("2024-01-01T10:00:00Z"),
      cards: [
        {
          id: "card-1",
          title: "Sample Card #1",
          content: "This is a sample card content.",
          listId: "list-1",
          order: 1000,
          priority: "NONE" as const,
          createdAt: new Date("2024-01-01T10:00:00Z"),
          updatedAt: new Date("2024-01-01T10:00:00Z"),
        },
      ],
    },
    {
      id: "list-2",
      title: "Todo",
      type: LIST_TYPES.TODO,
      order: 1,
      collapsed: false,
      createdAt: new Date("2024-01-01T10:00:00Z"),
      updatedAt: new Date("2024-01-01T10:00:00Z"),
      cards: [],
    },
  ],
  ...overrides,
});

export const createMockCard = (overrides?: Partial<Card>): Card => ({
  id: "card-123",
  title: "Test Card",
  content: "Test card content",
  listId: "list-123",
  order: 1000,
  priority: "NONE",
  createdAt: new Date("2024-01-01T10:00:00Z"),
  updatedAt: new Date("2024-01-01T10:00:00Z"),
  ...overrides,
});

// Form data factory for testing
export const createFormData = (data: Record<string, string>): FormData => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });
  return formData;
};

// Mock transaction helper
export const mockTransaction = <T>(result: T) => {
  mockPrismaClient.$transaction.mockImplementation(async callback => {
    return await callback(mockPrismaClient);
  });
  return result;
};

// Test cleanup helper
export const resetAllMocks = () => {
  vi.clearAllMocks();

  // Reset all prisma mock functions
  Object.values(mockPrismaClient.board).forEach(mock => mock.mockReset());
  Object.values(mockPrismaClient.list).forEach(mock => mock.mockReset());
  Object.values(mockPrismaClient.card).forEach(mock => mock.mockReset());
  mockPrismaClient.$transaction.mockReset();

  mockRevalidatePath.mockReset();
};

// Validation error helper
export const createZodError = (field: string, message: string) => {
  const error = new Error("Validation failed") as Error & {
    name: string;
    flatten: () => { fieldErrors: Record<string, string[]> };
  };
  error.name = "ZodError";
  error.flatten = () => ({
    fieldErrors: {
      [field]: [message],
    },
  });
  return error;
};

// Database error helper
export const createDatabaseError = (message: string = "Database operation failed") => {
  const error = new Error(message);
  error.name = "PrismaClientKnownRequestError";
  return error;
};

// Async test helper
export const waitForPromises = () => new Promise(resolve => setImmediate(resolve));
