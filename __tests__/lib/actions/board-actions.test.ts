import {
  mockAuthSession,
  createMockBoard,
  createMockBoardWithData,
  createFormData,
  createDatabaseError,
} from "@/__tests__/utils/test-helpers";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Import after mocking
import {
  createBoard,
  getUserBoards,
  getBoardBySlug,
  createDefaultBoard,
} from "@/lib/actions/board-actions";

// Mock external dependencies using hoisted functions
const mockAuth = vi.hoisted(() => vi.fn());
const mockPrismaClient = vi.hoisted(() => ({
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
}));
const mockRevalidatePath = vi.hoisted(() => vi.fn());

vi.mock("@/auth", () => ({
  auth: mockAuth,
}));

vi.mock("@/db/prisma", () => ({
  default: mockPrismaClient,
}));

vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

// Helper functions for this test file
const mockTransaction = <T>(result: T) => {
  mockPrismaClient.$transaction.mockImplementation(async callback => {
    return await callback(mockPrismaClient);
  });
  return result;
};

describe("Board Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset all prisma mock functions
    Object.values(mockPrismaClient.board).forEach(mock => mock.mockReset());
    Object.values(mockPrismaClient.list).forEach(mock => mock.mockReset());
    Object.values(mockPrismaClient.card).forEach(mock => mock.mockReset());
    mockPrismaClient.$transaction.mockReset();

    mockRevalidatePath.mockReset();
  });

  describe("getUserBoards", () => {
    it("should return boards for a user successfully", async () => {
      const mockBoards = [
        createMockBoard({ id: "board-1", title: "Board 1" }),
        createMockBoard({ id: "board-2", title: "Board 2" }),
      ];

      mockPrismaClient.board.findMany.mockResolvedValue(mockBoards);

      const result = await getUserBoards("test-user-id");

      expect(result).toEqual(mockBoards);
      expect(mockPrismaClient.board.findMany).toHaveBeenCalledWith({
        where: { userId: "test-user-id" },
        include: { lists: true },
        orderBy: { createdAt: "desc" },
      });
    });

    it("should return empty array when user has no boards", async () => {
      mockPrismaClient.board.findMany.mockResolvedValue([]);

      const result = await getUserBoards("test-user-id");

      expect(result).toEqual([]);
      expect(mockPrismaClient.board.findMany).toHaveBeenCalledWith({
        where: { userId: "test-user-id" },
        include: { lists: true },
        orderBy: { createdAt: "desc" },
      });
    });

    it("should handle database errors gracefully", async () => {
      const dbError = createDatabaseError("Connection failed");
      mockPrismaClient.board.findMany.mockRejectedValue(dbError);

      await expect(getUserBoards("test-user-id")).rejects.toThrow("Connection failed");
    });

    it("should filter boards by correct userId", async () => {
      const differentUserId = "different-user-id";
      mockPrismaClient.board.findMany.mockResolvedValue([]);

      await getUserBoards(differentUserId);

      expect(mockPrismaClient.board.findMany).toHaveBeenCalledWith({
        where: { userId: differentUserId },
        include: { lists: true },
        orderBy: { createdAt: "desc" },
      });
    });
  });

  describe("getBoardBySlug", () => {
    it("should return board with full data when found", async () => {
      const mockBoard = createMockBoardWithData();
      mockPrismaClient.board.findFirst.mockResolvedValue(mockBoard);

      const result = await getBoardBySlug("test-user-id", "test-board");

      expect(result).toEqual(mockBoard);
      expect(mockPrismaClient.board.findFirst).toHaveBeenCalledWith({
        where: { userId: "test-user-id", slug: "test-board" },
        include: {
          lists: {
            include: {
              cards: {
                orderBy: { order: "asc" },
              },
            },
            orderBy: { order: "asc" },
          },
        },
      });
    });

    it("should return null when board not found", async () => {
      mockPrismaClient.board.findFirst.mockResolvedValue(null);

      const result = await getBoardBySlug("test-user-id", "non-existent-board");

      expect(result).toBeNull();
    });

    it("should return null when board exists but belongs to different user", async () => {
      mockPrismaClient.board.findFirst.mockResolvedValue(null);

      const result = await getBoardBySlug("wrong-user-id", "test-board");

      expect(result).toBeNull();
      expect(mockPrismaClient.board.findFirst).toHaveBeenCalledWith({
        where: { userId: "wrong-user-id", slug: "test-board" },
        include: {
          lists: {
            include: {
              cards: {
                orderBy: { order: "asc" },
              },
            },
            orderBy: { order: "asc" },
          },
        },
      });
    });

    it("should handle database errors", async () => {
      const dbError = createDatabaseError("Database connection lost");
      mockPrismaClient.board.findFirst.mockRejectedValue(dbError);

      await expect(getBoardBySlug("test-user-id", "test-board")).rejects.toThrow(
        "Database connection lost"
      );
    });
  });

  describe("createBoard", () => {
    const validFormData = createFormData({
      title: "My New Board",
      slug: "my-new-board",
    });

    beforeEach(() => {
      mockAuth.mockResolvedValue(mockAuthSession());
      mockPrismaClient.board.count.mockResolvedValue(0);
      mockPrismaClient.board.findFirst.mockResolvedValue(null);
    });

    describe("Authentication scenarios", () => {
      it("should fail when user is not authenticated", async () => {
        mockAuth.mockResolvedValue(null);

        const result = await createBoard(null, validFormData);

        expect(result).toEqual({
          success: false,
          errors: { _form: ["Not authenticated"] },
        });
      });

      it("should fail when session has no user id", async () => {
        mockAuth.mockResolvedValue({ user: null });

        const result = await createBoard(null, validFormData);

        expect(result).toEqual({
          success: false,
          errors: { _form: ["Not authenticated"] },
        });
      });
    });

    describe("Board limits scenarios", () => {
      it("should fail when user has reached maximum board limit", async () => {
        mockPrismaClient.board.count.mockResolvedValue(2); // MAX_BOARDS_PER_USER = 2

        const result = await createBoard(null, validFormData);

        expect(result).toEqual({
          success: false,
          errors: { _form: ["Maximum 2 boards allowed"] },
        });
        expect(mockPrismaClient.board.count).toHaveBeenCalledWith({
          where: { userId: "test-user-id" },
        });
      });

      it("should proceed when user is under board limit", async () => {
        mockPrismaClient.board.count.mockResolvedValue(1);
        const mockBoard = createMockBoard();

        mockTransaction(mockBoard);
        mockPrismaClient.board.create.mockResolvedValue(mockBoard);
        mockPrismaClient.list.createMany.mockResolvedValue({ count: 5 });
        mockPrismaClient.list.findFirst.mockResolvedValue({ id: "todo-list-id" });
        mockPrismaClient.card.createMany.mockResolvedValue({ count: 3 });

        const result = await createBoard(null, validFormData);

        expect(result).toBeTruthy();
        expect(result!.success).toBe(true);
        expect(mockPrismaClient.board.count).toHaveBeenCalledWith({
          where: { userId: "test-user-id" },
        });
      });
    });

    describe("Validation scenarios", () => {
      it("should fail with invalid title (too short)", async () => {
        const invalidFormData = createFormData({
          title: "AB", // Less than 3 characters
          slug: "valid-slug",
        });

        const result = await createBoard(null, invalidFormData);

        expect(result).toBeTruthy();
        expect(result!.success).toBe(false);
        expect(result!.errors?.title).toContain("Minimum 3 letters");
      });

      it("should fail with invalid title (too long)", async () => {
        const invalidFormData = createFormData({
          title: "A".repeat(31), // More than 30 characters
          slug: "valid-slug",
        });

        const result = await createBoard(null, invalidFormData);

        expect(result).toBeTruthy();
        expect(result!.success).toBe(false);
        expect(result!.errors?.title).toContain("Title must be less than 30 characters");
      });

      it("should fail with invalid slug format", async () => {
        const invalidFormData = createFormData({
          title: "Valid Title",
          slug: "Invalid Slug!", // Contains spaces and special characters
        });

        const result = await createBoard(null, invalidFormData);

        expect(result).toBeTruthy();
        expect(result!.success).toBe(false);
        expect(result!.errors?.slug).toBeDefined();
      });

      it("should fail with empty form data", async () => {
        const emptyFormData = createFormData({});

        const result = await createBoard(null, emptyFormData);

        expect(result).toBeTruthy();
        expect(result!.success).toBe(false);
        expect(result!.errors).toBeDefined();
      });
    });

    describe("Slug uniqueness scenarios", () => {
      it("should fail when slug already exists for user", async () => {
        const existingBoard = createMockBoard({ slug: "my-new-board" });
        mockPrismaClient.board.findFirst.mockResolvedValue(existingBoard);

        const result = await createBoard(null, validFormData);

        expect(result).toEqual({
          success: false,
          errors: { slug: ["This URL is already taken"] },
        });
        expect(mockPrismaClient.board.findFirst).toHaveBeenCalledWith({
          where: {
            userId: "test-user-id",
            slug: "my-new-board",
          },
        });
      });

      it("should succeed when slug is unique for user", async () => {
        mockPrismaClient.board.findFirst.mockResolvedValue(null);
        const mockBoard = createMockBoard({ slug: "my-new-board" });

        mockTransaction(mockBoard);
        mockPrismaClient.board.create.mockResolvedValue(mockBoard);
        mockPrismaClient.list.createMany.mockResolvedValue({ count: 5 });
        mockPrismaClient.list.findFirst.mockResolvedValue({ id: "todo-list-id" });
        mockPrismaClient.card.createMany.mockResolvedValue({ count: 3 });

        const result = await createBoard(null, validFormData);

        expect(result).toBeTruthy();
        expect(result!.success).toBe(true);
        expect(result!.data).toEqual(mockBoard);
      });
    });

    describe("Transaction success scenarios", () => {
      it("should create board with lists and initial cards successfully", async () => {
        const mockBoard = createMockBoard();

        mockTransaction(mockBoard);
        mockPrismaClient.board.create.mockResolvedValue(mockBoard);
        mockPrismaClient.list.createMany.mockResolvedValue({ count: 5 });
        mockPrismaClient.list.findFirst.mockResolvedValue({ id: "todo-list-id" });
        mockPrismaClient.card.createMany.mockResolvedValue({ count: 3 });

        const result = await createBoard(null, validFormData);

        expect(result).toEqual({
          success: true,
          data: mockBoard,
          message: "Board created successfully",
          redirectTo: "/board/my-new-board",
        });

        // Verify transaction calls
        expect(mockPrismaClient.$transaction).toHaveBeenCalled();
        expect(mockPrismaClient.board.create).toHaveBeenCalled();
        expect(mockPrismaClient.list.createMany).toHaveBeenCalled();
        expect(mockPrismaClient.card.createMany).toHaveBeenCalled();

        // Verify revalidation calls
        expect(mockRevalidatePath).toHaveBeenCalledWith("/join");
        expect(mockRevalidatePath).toHaveBeenCalledWith("/board/my-new-board");
      });

      it("should create lists with correct workspace template data", async () => {
        const mockBoard = createMockBoard({ id: "new-board-id" });

        mockTransaction(mockBoard);
        mockPrismaClient.board.create.mockResolvedValue(mockBoard);
        mockPrismaClient.list.createMany.mockResolvedValue({ count: 5 });
        mockPrismaClient.list.findFirst.mockResolvedValue({ id: "todo-list-id" });
        mockPrismaClient.card.createMany.mockResolvedValue({ count: 3 });

        await createBoard(null, validFormData);

        // Verify lists are created with correct template data
        expect(mockPrismaClient.list.createMany).toHaveBeenCalledWith({
          data: expect.arrayContaining([
            expect.objectContaining({
              title: "Backlog",
              boardId: "new-board-id",
              type: "BACKLOG",
              order: 0,
            }),
            expect.objectContaining({
              title: "Todo",
              boardId: "new-board-id",
              type: "TODO",
              order: 1,
            }),
            expect.objectContaining({
              title: "In Progress",
              boardId: "new-board-id",
              type: "IN_PROGRESS",
              order: 2,
            }),
            expect.objectContaining({
              title: "Done",
              boardId: "new-board-id",
              type: "DONE",
              order: 3,
            }),
            expect.objectContaining({
              title: "Canceled",
              boardId: "new-board-id",
              type: "CANCELED",
              order: 4,
            }),
          ]),
        });
      });

      it("should create initial cards in todo list", async () => {
        const mockBoard = createMockBoard();
        const todoListId = "todo-list-123";

        mockTransaction(mockBoard);
        mockPrismaClient.board.create.mockResolvedValue(mockBoard);
        mockPrismaClient.list.createMany.mockResolvedValue({ count: 5 });
        mockPrismaClient.list.findFirst.mockResolvedValue({ id: todoListId });
        mockPrismaClient.card.createMany.mockResolvedValue({ count: 3 });

        await createBoard(null, validFormData);

        // Verify initial cards are created
        expect(mockPrismaClient.card.createMany).toHaveBeenCalledWith({
          data: [
            {
              title: "Sample Card #1",
              content: "This is a sample card content.",
              listId: todoListId,
              order: 1000,
            },
            {
              title: "Sample Card #2",
              content: "This is another sample card content.",
              listId: todoListId,
              order: 2000,
            },
            {
              title: "Sample Card #3",
              content: "This is yet another sample card content.",
              listId: todoListId,
              order: 3000,
            },
          ],
        });
      });
    });

    describe("Transaction failure scenarios", () => {
      it("should handle transaction failure when board creation fails", async () => {
        const dbError = createDatabaseError("Board creation failed");
        mockPrismaClient.$transaction.mockRejectedValue(dbError);

        const result = await createBoard(null, validFormData);

        expect(result).toEqual({
          success: false,
          errors: { _form: ["Something went wrong"] },
        });
      });

      it("should handle transaction failure when todo list is not found", async () => {
        mockTransaction(null);
        mockPrismaClient.board.create.mockResolvedValue(createMockBoard());
        mockPrismaClient.list.createMany.mockResolvedValue({ count: 5 });
        mockPrismaClient.list.findFirst.mockResolvedValue(null); // not found

        const transactionCallback = vi.fn().mockImplementation(async () => {
          throw new Error("Todo list not found");
        });
        mockPrismaClient.$transaction.mockImplementation(transactionCallback);

        const result = await createBoard(null, validFormData);

        expect(result).toEqual({
          success: false,
          errors: { _form: ["Something went wrong"] },
        });
      });

      it("should handle list creation failure", async () => {
        const listCreationError = createDatabaseError("Failed to create lists");

        mockPrismaClient.$transaction.mockImplementation(async () => {
          mockPrismaClient.board.create.mockResolvedValue(createMockBoard());
          mockPrismaClient.list.createMany.mockRejectedValue(listCreationError);
          throw listCreationError;
        });

        const result = await createBoard(null, validFormData);

        expect(result).toEqual({
          success: false,
          errors: { _form: ["Something went wrong"] },
        });
      });

      it("should handle card creation failure", async () => {
        const cardCreationError = createDatabaseError("Failed to create cards");

        mockPrismaClient.$transaction.mockImplementation(async () => {
          mockPrismaClient.board.create.mockResolvedValue(createMockBoard());
          mockPrismaClient.list.createMany.mockResolvedValue({ count: 5 });
          mockPrismaClient.list.findFirst.mockResolvedValue({ id: "todo-list-id" });
          mockPrismaClient.card.createMany.mockRejectedValue(cardCreationError);
          throw cardCreationError;
        });

        const result = await createBoard(null, validFormData);

        expect(result).toEqual({
          success: false,
          errors: { _form: ["Something went wrong"] },
        });
      });
    });

    describe("Edge cases", () => {
      it("should handle malformed form data gracefully", async () => {
        const malformedFormData = new FormData();
        malformedFormData.append("title", "");
        malformedFormData.append("slug", "");

        const result = await createBoard(null, malformedFormData);

        expect(result).toBeTruthy();
        expect(result!.success).toBe(false);
        expect(result!.errors).toBeDefined();
      });

      it("should handle concurrent board creation attempts", async () => {
        // First call succeeds
        mockPrismaClient.board.findFirst.mockResolvedValueOnce(null);
        const mockBoard = createMockBoard();
        mockTransaction(mockBoard);
        mockPrismaClient.board.create.mockResolvedValue(mockBoard);
        mockPrismaClient.list.createMany.mockResolvedValue({ count: 5 });
        mockPrismaClient.list.findFirst.mockResolvedValue({ id: "todo-list-id" });
        mockPrismaClient.card.createMany.mockResolvedValue({ count: 3 });

        // Second call finds existing board
        mockPrismaClient.board.findFirst.mockResolvedValueOnce(mockBoard);

        const [result1, result2] = await Promise.all([
          createBoard(null, validFormData),
          createBoard(null, validFormData),
        ]);

        expect(result1).toBeTruthy();
        expect(result1!.success).toBe(true);
        expect(result2).toBeTruthy();
        expect(result2!.success).toBe(false);
        expect(result2!.errors?.slug).toContain("This URL is already taken");
      });

      it("should handle very long slug after validation", async () => {
        const longSlugData = createFormData({
          title: "Valid Title",
          slug: "a".repeat(50), // Exceeds 40 character limit
        });

        const result = await createBoard(null, longSlugData);

        expect(result).toBeTruthy();
        expect(result!.success).toBe(false);
        expect(result!.errors?.slug).toBeDefined();
      });
    });
  });

  describe("createDefaultBoard (deprecated)", () => {
    it("should create a default board with basic lists", async () => {
      const mockBoard = createMockBoard({
        title: "Untitled Board",
        slug: "untitled-board",
      });

      mockPrismaClient.board.create.mockResolvedValue(mockBoard);
      mockPrismaClient.list.createMany.mockResolvedValue({ count: 3 });

      const result = await createDefaultBoard("test-user-id");

      expect(result).toEqual(mockBoard);
      expect(mockPrismaClient.board.create).toHaveBeenCalledWith({
        data: {
          title: "Untitled Board",
          slug: "untitled-board",
          userId: "test-user-id",
        },
      });

      expect(mockPrismaClient.list.createMany).toHaveBeenCalledWith({
        data: [
          { title: "To Do", boardId: mockBoard.id, order: 1 },
          { title: "In Progress", boardId: mockBoard.id, order: 2 },
          { title: "Done", boardId: mockBoard.id, order: 3 },
        ],
      });
    });

    it("should handle database errors in deprecated function", async () => {
      const dbError = createDatabaseError("Failed to create default board");
      mockPrismaClient.board.create.mockRejectedValue(dbError);

      await expect(createDefaultBoard("test-user-id")).rejects.toThrow(
        "Failed to create default board"
      );
    });
  });
});
