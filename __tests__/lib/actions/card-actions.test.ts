import {
  mockAuthSession,
  createMockCard,
  createFormData,
  createDatabaseError,
} from "@/__tests__/utils/test-helpers";
import type { Card, CardPriority } from "@/types/database";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Import after mocking
import {
  createCard,
  updateCardPriority,
  moveCardToColumn,
  reorderCardsInList,
  updateCardContent,
} from "@/lib/actions/card-actions";

// Mock external dependencies using hoisted functions
const mockAuth = vi.hoisted(() => vi.fn());
const mockPrismaClient = vi.hoisted(() => ({
  card: {
    create: vi.fn(),
    update: vi.fn(),
    aggregate: vi.fn(),
    findMany: vi.fn(),
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
    if (Array.isArray(callback)) {
      return result;
    }
    return await callback(mockPrismaClient);
  });
  return result;
};

describe("Card Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset all prisma mock functions
    Object.values(mockPrismaClient.card).forEach(mock => mock.mockReset());
    mockPrismaClient.$transaction.mockReset();
    mockRevalidatePath.mockReset();
  });

  describe("createCard", () => {
    const validFormData = createFormData({
      title: "New Card Title",
      content: "New card content",
      listId: "550e8400-e29b-41d4-a716-446655440000",
      boardSlug: "test-board",
    });

    beforeEach(() => {
      mockAuth.mockResolvedValue(mockAuthSession());
    });

    describe("Authentication scenarios", () => {
      it("should fail when user is not authenticated", async () => {
        mockAuth.mockResolvedValue(null);

        const result = await createCard({ success: false }, validFormData);

        expect(result).toEqual({
          success: false,
          errors: { _form: ["Not authenticated"] },
        });
        expect(mockPrismaClient.$transaction).not.toHaveBeenCalled();
      });

      it("should fail when session has no user id", async () => {
        mockAuth.mockResolvedValue({ user: null });

        const result = await createCard({ success: false }, validFormData);

        expect(result).toEqual({
          success: false,
          errors: { _form: ["Not authenticated"] },
        });
        expect(mockPrismaClient.$transaction).not.toHaveBeenCalled();
      });

      it("should fail when session user has no id", async () => {
        mockAuth.mockResolvedValue({ user: {} });

        const result = await createCard({ success: false }, validFormData);

        expect(result).toEqual({
          success: false,
          errors: { _form: ["Not authenticated"] },
        });
        expect(mockPrismaClient.$transaction).not.toHaveBeenCalled();
      });
    });

    describe("Validation scenarios", () => {
      it("should fail with invalid title (too short)", async () => {
        const invalidFormData = createFormData({
          title: "AB", // Less than 3 characters
          content: "Valid content",
          listId: "550e8400-e29b-41d4-a716-446655440000",
          boardSlug: "test-board",
        });

        const result = await createCard({ success: false }, invalidFormData);

        expect(result.success).toBe(false);
        expect(result.errors?.title).toContain("Title must be at least 3 characters");
      });

      it("should fail with invalid title (too long)", async () => {
        const invalidFormData = createFormData({
          title: "A".repeat(101), // More than 100 characters
          content: "Valid content",
          listId: "550e8400-e29b-41d4-a716-446655440000",
          boardSlug: "test-board",
        });

        const result = await createCard({ success: false }, invalidFormData);

        expect(result.success).toBe(false);
        expect(result.errors?.title).toContain("Title must be less than 100 characters");
      });

      it("should fail with invalid listId (not UUID)", async () => {
        const invalidFormData = createFormData({
          title: "Valid Title",
          content: "Valid content",
          listId: "invalid-list-id", // Not a UUID
          boardSlug: "test-board",
        });

        const result = await createCard({ success: false }, invalidFormData);

        expect(result.success).toBe(false);
        expect(result.errors?.listId).toContain("Invalid list ID");
      });

      it("should fail with missing required fields", async () => {
        const invalidFormData = createFormData({
          content: "Valid content",
          boardSlug: "test-board",
          // Missing title and listId
        });

        const result = await createCard({ success: false }, invalidFormData);

        expect(result.success).toBe(false);
        expect(result.errors).toBeDefined();
      });

      it("should succeed with valid data and no content", async () => {
        const validFormDataNoContent = createFormData({
          title: "Valid Title",
          content: "", // Empty content should be allowed
          listId: "550e8400-e29b-41d4-a716-446655440000",
          boardSlug: "test-board",
        });

        const mockCard = createMockCard({
          title: "Valid Title",
          content: null,
          listId: "550e8400-e29b-41d4-a716-446655440000",
        });

        mockTransaction(mockCard);
        mockPrismaClient.card.aggregate.mockResolvedValue({ _max: { order: null } });
        mockPrismaClient.card.create.mockResolvedValue(mockCard);

        const result = await createCard({ success: false }, validFormDataNoContent);

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockCard);
        expect(result.message).toBe("Card created successfully");
      });
    });

    describe("Order calculation scenarios", () => {
      it("should set order to 1000 for first card in empty list", async () => {
        const mockCard = createMockCard({ order: 1000 });

        mockTransaction(mockCard);
        mockPrismaClient.card.aggregate.mockResolvedValue({ _max: { order: null } });
        mockPrismaClient.card.create.mockResolvedValue(mockCard);

        const result = await createCard({ success: false }, validFormData);

        expect(result.success).toBe(true);
        expect(mockPrismaClient.card.aggregate).toHaveBeenCalledWith({
          where: { listId: "550e8400-e29b-41d4-a716-446655440000" },
          _max: { order: true },
        });
        expect(mockPrismaClient.card.create).toHaveBeenCalledWith({
          data: {
            title: "New Card Title",
            content: "New card content",
            listId: "550e8400-e29b-41d4-a716-446655440000",
            order: 1000,
          },
        });
      });

      it("should increment order by 1000 when cards exist", async () => {
        const mockCard = createMockCard({ order: 3000 });

        mockTransaction(mockCard);
        mockPrismaClient.card.aggregate.mockResolvedValue({ _max: { order: 2000 } });
        mockPrismaClient.card.create.mockResolvedValue(mockCard);

        const result = await createCard({ success: false }, validFormData);

        expect(result.success).toBe(true);
        expect(mockPrismaClient.card.create).toHaveBeenCalledWith({
          data: {
            title: "New Card Title",
            content: "New card content",
            listId: "550e8400-e29b-41d4-a716-446655440000",
            order: 3000,
          },
        });
      });

      it("should handle zero order case", async () => {
        const mockCard = createMockCard({ order: 1000 });

        mockTransaction(mockCard);
        mockPrismaClient.card.aggregate.mockResolvedValue({ _max: { order: 0 } });
        mockPrismaClient.card.create.mockResolvedValue(mockCard);

        const result = await createCard({ success: false }, validFormData);

        expect(result.success).toBe(true);
        expect(mockPrismaClient.card.create).toHaveBeenCalledWith({
          data: {
            title: "New Card Title",
            content: "New card content",
            listId: "550e8400-e29b-41d4-a716-446655440000",
            order: 1000,
          },
        });
      });
    });

    describe("Transaction success scenarios", () => {
      it("should create card successfully and revalidate path", async () => {
        const mockCard = createMockCard();

        mockTransaction(mockCard);
        mockPrismaClient.card.aggregate.mockResolvedValue({ _max: { order: 1000 } });
        mockPrismaClient.card.create.mockResolvedValue(mockCard);

        const result = await createCard({ success: false }, validFormData);

        expect(result).toEqual({
          success: true,
          data: mockCard,
          message: "Card created successfully",
        });

        expect(mockPrismaClient.$transaction).toHaveBeenCalled();
        expect(mockRevalidatePath).toHaveBeenCalledWith("/board/test-board", "layout");
      });

      it("should handle large existing order values", async () => {
        const mockCard = createMockCard({ order: 1001000 });

        mockTransaction(mockCard);
        mockPrismaClient.card.aggregate.mockResolvedValue({ _max: { order: 1000000 } });
        mockPrismaClient.card.create.mockResolvedValue(mockCard);

        const result = await createCard({ success: false }, validFormData);

        expect(result.success).toBe(true);
        expect(mockPrismaClient.card.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            order: 1001000,
          }),
        });
      });
    });

    describe("Transaction failure scenarios", () => {
      it("should handle transaction failure during aggregation", async () => {
        const dbError = createDatabaseError("Aggregation failed");
        mockPrismaClient.$transaction.mockRejectedValue(dbError);

        const result = await createCard({ success: false }, validFormData);

        expect(result).toEqual({
          success: false,
          errors: { _form: ["Something went wrong"] },
        });
      });

      it("should handle transaction failure during card creation", async () => {
        const dbError = createDatabaseError("Card creation failed");
        mockPrismaClient.$transaction.mockRejectedValue(dbError);

        const result = await createCard({ success: false }, validFormData);

        expect(result).toEqual({
          success: false,
          errors: { _form: ["Something went wrong"] },
        });
      });

      it("should handle transaction rollback on error", async () => {
        const transactionError = createDatabaseError("Transaction rollback");

        mockPrismaClient.$transaction.mockImplementation(async () => {
          throw transactionError;
        });

        const result = await createCard({ success: false }, validFormData);

        expect(result).toEqual({
          success: false,
          errors: { _form: ["Something went wrong"] },
        });
        expect(mockRevalidatePath).not.toHaveBeenCalled();
      });
    });
  });

  describe("updateCardPriority", () => {
    const validCardId = "550e8400-e29b-41d4-a716-446655440000";
    const validPriority: CardPriority = "HIGH";

    beforeEach(() => {
      mockAuth.mockResolvedValue(mockAuthSession());
    });

    describe("Authentication scenarios", () => {
      it("should fail when user is not authenticated", async () => {
        mockAuth.mockResolvedValue(null);

        const result = await updateCardPriority(validCardId, validPriority);

        expect(result).toEqual({
          success: false,
          errors: { _form: ["Not authenticated"] },
        });
        expect(mockPrismaClient.card.update).not.toHaveBeenCalled();
      });

      it("should fail when session has no user", async () => {
        mockAuth.mockResolvedValue({ user: null });

        const result = await updateCardPriority(validCardId, validPriority);

        expect(result).toEqual({
          success: false,
          errors: { _form: ["Not authenticated"] },
        });
      });

      it("should fail when session user has no id", async () => {
        mockAuth.mockResolvedValue({ user: {} });

        const result = await updateCardPriority(validCardId, validPriority);

        expect(result).toEqual({
          success: false,
          errors: { _form: ["Not authenticated"] },
        });
      });
    });

    describe("Validation scenarios", () => {
      it("should fail with invalid cardId (not UUID)", async () => {
        const result = await updateCardPriority("invalid-card-id", validPriority);

        expect(result.success).toBe(false);
        expect(result.errors?.cardId).toContain("Invalid card ID");
      });

      it("should fail with invalid priority", async () => {
        // @ts-expect-error Testing invalid priority
        const result = await updateCardPriority(validCardId, "INVALID_PRIORITY");

        expect(result.success).toBe(false);
        expect(result.errors?.priority).toBeDefined();
      });

      it("should succeed with all valid priority levels", async () => {
        const priorities: CardPriority[] = ["NONE", "LOW", "MEDIUM", "HIGH", "URGENT"];

        for (const priority of priorities) {
          const mockCard = createMockCard({ priority });
          mockPrismaClient.card.update.mockResolvedValue(mockCard);

          const result = await updateCardPriority(validCardId, priority);

          expect(result.success).toBe(true);
          expect(result.data?.priority).toBe(priority);
        }
      });
    });

    describe("Success scenarios", () => {
      it("should update card priority successfully", async () => {
        const mockCard = createMockCard({
          id: validCardId,
          priority: validPriority,
        });
        mockPrismaClient.card.update.mockResolvedValue(mockCard);

        const result = await updateCardPriority(validCardId, validPriority);

        expect(result).toEqual({
          success: true,
          data: mockCard,
          message: "Card priority updated successfully",
        });

        expect(mockPrismaClient.card.update).toHaveBeenCalledWith({
          where: { id: validCardId },
          data: { priority: validPriority },
        });
      });

      it("should handle priority update to NONE", async () => {
        const mockCard = createMockCard({
          id: validCardId,
          priority: "NONE",
        });
        mockPrismaClient.card.update.mockResolvedValue(mockCard);

        const result = await updateCardPriority(validCardId, "NONE");

        expect(result.success).toBe(true);
        expect(result.data?.priority).toBe("NONE");
      });

      it("should handle priority update to URGENT", async () => {
        const mockCard = createMockCard({
          id: validCardId,
          priority: "URGENT",
        });
        mockPrismaClient.card.update.mockResolvedValue(mockCard);

        const result = await updateCardPriority(validCardId, "URGENT");

        expect(result.success).toBe(true);
        expect(result.data?.priority).toBe("URGENT");
      });
    });

    describe("Database error scenarios", () => {
      it("should handle database update failure", async () => {
        const dbError = createDatabaseError("Card not found");
        mockPrismaClient.card.update.mockRejectedValue(dbError);

        const result = await updateCardPriority(validCardId, validPriority);

        expect(result).toEqual({
          success: false,
          errors: { _form: ["Something went wrong"] },
        });
      });

      it("should handle constraint violation", async () => {
        const constraintError = createDatabaseError("Foreign key constraint failed");
        mockPrismaClient.card.update.mockRejectedValue(constraintError);

        const result = await updateCardPriority(validCardId, validPriority);

        expect(result).toEqual({
          success: false,
          errors: { _form: ["Something went wrong"] },
        });
      });

      it("should log error to console", async () => {
        const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        const dbError = createDatabaseError("Database error");
        mockPrismaClient.card.update.mockRejectedValue(dbError);

        await updateCardPriority(validCardId, validPriority);

        expect(consoleErrorSpy).toHaveBeenCalledWith("Error updating card priority:", dbError);
        consoleErrorSpy.mockRestore();
      });
    });

    describe("Edge cases", () => {
      it("should handle same priority update", async () => {
        const mockCard = createMockCard({
          id: validCardId,
          priority: "HIGH",
        });
        mockPrismaClient.card.update.mockResolvedValue(mockCard);

        const result = await updateCardPriority(validCardId, "HIGH");

        expect(result.success).toBe(true);
        expect(mockPrismaClient.card.update).toHaveBeenCalledWith({
          where: { id: validCardId },
          data: { priority: "HIGH" },
        });
      });

      it("should handle non-existent card gracefully", async () => {
        const notFoundError = new Error("Record not found");
        notFoundError.name = "NotFoundError";
        mockPrismaClient.card.update.mockRejectedValue(notFoundError);

        const result = await updateCardPriority(validCardId, validPriority);

        expect(result.success).toBe(false);
        expect(result.errors?._form).toContain("Something went wrong");
      });
    });
  });

  describe("moveCardToColumn", () => {
    const validCardId = "550e8400-e29b-41d4-a716-446655440000";
    const validListId = "550e8400-e29b-41d4-a716-446655440001";

    beforeEach(() => {
      mockAuth.mockResolvedValue(mockAuthSession());
    });

    describe("Authentication scenarios", () => {
      it("should fail when user is not authenticated", async () => {
        mockAuth.mockResolvedValue(null);

        const result = await moveCardToColumn(validCardId, validListId);

        expect(result).toEqual({
          success: false,
          errors: { _form: ["Not authenticated"] },
        });
        expect(mockPrismaClient.$transaction).not.toHaveBeenCalled();
      });

      it("should fail when session has no user id", async () => {
        mockAuth.mockResolvedValue({ user: null });

        const result = await moveCardToColumn(validCardId, validListId);

        expect(result).toEqual({
          success: false,
          errors: { _form: ["Not authenticated"] },
        });
      });
    });

    describe("Validation scenarios", () => {
      it("should fail with invalid cardId (not UUID)", async () => {
        const result = await moveCardToColumn("invalid-card-id", validListId);

        expect(result.success).toBe(false);
        expect(result.errors?.cardId).toContain("Invalid card ID");
      });

      it("should fail with invalid listId (not UUID)", async () => {
        const result = await moveCardToColumn(validCardId, "invalid-list-id");

        expect(result.success).toBe(false);
        expect(result.errors?.listId).toContain("Invalid list ID");
      });

      it("should fail with both invalid IDs", async () => {
        const result = await moveCardToColumn("invalid-card", "invalid-list");

        expect(result.success).toBe(false);
        expect(result.errors?.cardId).toBeDefined();
        expect(result.errors?.listId).toBeDefined();
      });
    });

    describe("Order calculation scenarios", () => {
      it("should move card to empty list with order 1000", async () => {
        const mockCard = createMockCard({
          id: validCardId,
          listId: validListId,
          order: 1000,
        });

        mockTransaction(mockCard);
        mockPrismaClient.card.aggregate.mockResolvedValue({ _max: { order: null } });
        mockPrismaClient.card.update.mockResolvedValue(mockCard);

        const result = await moveCardToColumn(validCardId, validListId);

        expect(result.success).toBe(true);
        expect(mockPrismaClient.card.aggregate).toHaveBeenCalledWith({
          where: { listId: validListId },
          _max: { order: true },
        });
        expect(mockPrismaClient.card.update).toHaveBeenCalledWith({
          where: { id: validCardId },
          data: {
            listId: validListId,
            order: 1000,
          },
        });
      });

      it("should move card to list with existing cards", async () => {
        const mockCard = createMockCard({
          id: validCardId,
          listId: validListId,
          order: 3000,
        });

        mockTransaction(mockCard);
        mockPrismaClient.card.aggregate.mockResolvedValue({ _max: { order: 2000 } });
        mockPrismaClient.card.update.mockResolvedValue(mockCard);

        const result = await moveCardToColumn(validCardId, validListId);

        expect(result.success).toBe(true);
        expect(mockPrismaClient.card.update).toHaveBeenCalledWith({
          where: { id: validCardId },
          data: {
            listId: validListId,
            order: 3000,
          },
        });
      });

      it("should handle zero order case", async () => {
        const mockCard = createMockCard({
          id: validCardId,
          listId: validListId,
          order: 1000,
        });

        mockTransaction(mockCard);
        mockPrismaClient.card.aggregate.mockResolvedValue({ _max: { order: 0 } });
        mockPrismaClient.card.update.mockResolvedValue(mockCard);

        const result = await moveCardToColumn(validCardId, validListId);

        expect(result.success).toBe(true);
        expect(mockPrismaClient.card.update).toHaveBeenCalledWith({
          where: { id: validCardId },
          data: {
            listId: validListId,
            order: 1000,
          },
        });
      });
    });

    describe("Success scenarios", () => {
      it("should move card successfully", async () => {
        const mockCard = createMockCard({
          id: validCardId,
          listId: validListId,
        });

        mockTransaction(mockCard);
        mockPrismaClient.card.aggregate.mockResolvedValue({ _max: { order: 1000 } });
        mockPrismaClient.card.update.mockResolvedValue(mockCard);

        const result = await moveCardToColumn(validCardId, validListId);

        expect(result).toEqual({
          success: true,
          data: mockCard,
          message: "Card moved to column successfully",
        });

        expect(mockPrismaClient.$transaction).toHaveBeenCalled();
      });

      it("should handle large order values", async () => {
        const mockCard = createMockCard({
          id: validCardId,
          listId: validListId,
          order: 1001000,
        });

        mockTransaction(mockCard);
        mockPrismaClient.card.aggregate.mockResolvedValue({ _max: { order: 1000000 } });
        mockPrismaClient.card.update.mockResolvedValue(mockCard);

        const result = await moveCardToColumn(validCardId, validListId);

        expect(result.success).toBe(true);
        expect(result.data?.order).toBe(1001000);
      });
    });

    describe("Transaction failure scenarios", () => {
      it("should handle transaction failure during aggregation", async () => {
        const dbError = createDatabaseError("Aggregation failed");
        mockPrismaClient.$transaction.mockRejectedValue(dbError);

        const result = await moveCardToColumn(validCardId, validListId);

        expect(result).toEqual({
          success: false,
          errors: { _form: ["Something went wrong"] },
        });
      });

      it("should handle transaction failure during card update", async () => {
        const dbError = createDatabaseError("Card update failed");
        mockPrismaClient.$transaction.mockRejectedValue(dbError);

        const result = await moveCardToColumn(validCardId, validListId);

        expect(result).toEqual({
          success: false,
          errors: { _form: ["Something went wrong"] },
        });
      });

      it("should handle constraint violations", async () => {
        const constraintError = createDatabaseError("Foreign key constraint failed");
        mockPrismaClient.$transaction.mockRejectedValue(constraintError);

        const result = await moveCardToColumn(validCardId, validListId);

        expect(result).toEqual({
          success: false,
          errors: { _form: ["Something went wrong"] },
        });
      });

      it("should log error to console", async () => {
        const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        const dbError = createDatabaseError("Transaction error");
        mockPrismaClient.$transaction.mockRejectedValue(dbError);

        await moveCardToColumn(validCardId, validListId);

        expect(consoleErrorSpy).toHaveBeenCalledWith("Error moving card to column:", dbError);
        consoleErrorSpy.mockRestore();
      });
    });

    describe("Edge cases", () => {
      it("should handle moving card to same list", async () => {
        const mockCard = createMockCard({
          id: validCardId,
          listId: validListId,
        });

        mockTransaction(mockCard);
        mockPrismaClient.card.aggregate.mockResolvedValue({ _max: { order: 2000 } });
        mockPrismaClient.card.update.mockResolvedValue(mockCard);

        const result = await moveCardToColumn(validCardId, validListId);

        expect(result.success).toBe(true);
        expect(mockPrismaClient.card.update).toHaveBeenCalledWith({
          where: { id: validCardId },
          data: {
            listId: validListId,
            order: 3000,
          },
        });
      });

      it("should handle non-existent card", async () => {
        const notFoundError = new Error("Card not found");
        notFoundError.name = "NotFoundError";
        mockPrismaClient.$transaction.mockRejectedValue(notFoundError);

        const result = await moveCardToColumn(validCardId, validListId);

        expect(result.success).toBe(false);
        expect(result.errors?._form).toContain("Something went wrong");
      });

      it("should handle non-existent target list", async () => {
        const listNotFoundError = createDatabaseError("List not found");
        mockPrismaClient.$transaction.mockRejectedValue(listNotFoundError);

        const result = await moveCardToColumn(validCardId, validListId);

        expect(result.success).toBe(false);
        expect(result.errors?._form).toContain("Something went wrong");
      });
    });
  });

  describe("reorderCardsInList", () => {
    const validListId = "550e8400-e29b-41d4-a716-446655440000";
    const mockCards: Card[] = [
      createMockCard({ id: "card-1", order: 1000 }),
      createMockCard({ id: "card-2", order: 2000 }),
      createMockCard({ id: "card-3", order: 3000 }),
    ];

    beforeEach(() => {
      mockAuth.mockResolvedValue(mockAuthSession());
    });

    describe("Authentication scenarios", () => {
      it("should fail when user is not authenticated", async () => {
        mockAuth.mockResolvedValue(null);

        const result = await reorderCardsInList(validListId, mockCards);

        expect(result).toEqual({
          success: false,
          errors: { _form: ["Not authenticated"] },
        });
        expect(mockPrismaClient.$transaction).not.toHaveBeenCalled();
      });

      it("should fail when session has no user", async () => {
        mockAuth.mockResolvedValue({ user: null });

        const result = await reorderCardsInList(validListId, mockCards);

        expect(result).toEqual({
          success: false,
          errors: { _form: ["Not authenticated"] },
        });
      });

      it("should fail when session user has no id", async () => {
        mockAuth.mockResolvedValue({ user: {} });

        const result = await reorderCardsInList(validListId, mockCards);

        expect(result).toEqual({
          success: false,
          errors: { _form: ["Not authenticated"] },
        });
      });
    });

    describe("Validation scenarios", () => {
      it("should fail with invalid listId (not UUID)", async () => {
        const result = await reorderCardsInList("invalid-list-id", mockCards);

        expect(result.success).toBe(false);
        // Validation errors for listId get caught by ZodError handler, but only
        // orderedCardIds field errors are mapped to reorderedCards, so reorderedCards is undefined
        expect(result.errors?.reorderedCards).toBeUndefined();
      });

      it("should fail with empty cards array", async () => {
        const result = await reorderCardsInList(validListId, []);

        expect(result).toEqual({
          success: false,
          errors: { reorderedCards: ["No cards to reorder"] },
        });
        expect(mockPrismaClient.$transaction).not.toHaveBeenCalled();
      });

      it("should succeed with valid listId and cards", async () => {
        const validListIdUUID = "550e8400-e29b-41d4-a716-446655440000";
        const reorderedCards = mockCards.map((card, index) => ({
          ...card,
          order: (index + 1) * 1000,
        }));

        mockTransaction(reorderedCards);

        const result = await reorderCardsInList(validListIdUUID, mockCards);

        expect(result.success).toBe(true);
        expect(result.data).toEqual(reorderedCards);
      });
    });

    describe("Order assignment scenarios", () => {
      it("should assign correct order values starting from 1000", async () => {
        const validListIdUUID = "550e8400-e29b-41d4-a716-446655440000";
        const reorderedCards = [
          createMockCard({ id: "card-2", order: 1000 }),
          createMockCard({ id: "card-1", order: 2000 }),
          createMockCard({ id: "card-3", order: 3000 }),
        ];

        mockTransaction(reorderedCards);

        const result = await reorderCardsInList(validListIdUUID, [
          createMockCard({ id: "card-2" }),
          createMockCard({ id: "card-1" }),
          createMockCard({ id: "card-3" }),
        ]);

        expect(result.success).toBe(true);
        expect(result.data).toEqual(reorderedCards);
      });

      it("should handle single card reorder", async () => {
        const validListIdUUID = "550e8400-e29b-41d4-a716-446655440000";
        const singleCard = [createMockCard({ id: "card-1" })];
        const reorderedCard = createMockCard({ id: "card-1", order: 1000 });

        mockTransaction([reorderedCard]);

        const result = await reorderCardsInList(validListIdUUID, singleCard);

        expect(result.success).toBe(true);
        expect(result.data).toEqual([reorderedCard]);
      });

      it("should handle large number of cards", async () => {
        const validListIdUUID = "550e8400-e29b-41d4-a716-446655440000";
        const manyCards = Array.from({ length: 20 }, (_, index) =>
          createMockCard({ id: `card-${index + 1}` })
        );
        const reorderedCards = manyCards.map((card, index) => ({
          ...card,
          order: (index + 1) * 1000,
        }));

        mockTransaction(reorderedCards);

        const result = await reorderCardsInList(validListIdUUID, manyCards);

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(20);
        expect(result.data?.[19]?.order).toBe(20000);
      });
    });

    describe("Success scenarios", () => {
      it("should reorder cards successfully", async () => {
        const validListIdUUID = "550e8400-e29b-41d4-a716-446655440000";
        const reorderedCards = mockCards.map((card, index) => ({
          ...card,
          order: (index + 1) * 1000,
        }));

        mockTransaction(reorderedCards);

        const result = await reorderCardsInList(validListIdUUID, mockCards);

        expect(result).toEqual({
          success: true,
          data: reorderedCards,
          message: "Card sorted successfully",
        });

        expect(mockPrismaClient.$transaction).toHaveBeenCalled();
      });

      it("should preserve card properties during reorder", async () => {
        const validListIdUUID = "550e8400-e29b-41d4-a716-446655440000";
        const cardsWithVariousProps = [
          createMockCard({
            id: "card-1",
            title: "High Priority Card",
            priority: "HIGH",
            content: "Important task",
          }),
          createMockCard({
            id: "card-2",
            title: "Low Priority Card",
            priority: "LOW",
            content: null,
          }),
        ];

        const reorderedCards = cardsWithVariousProps.map((card, index) => ({
          ...card,
          order: (index + 1) * 1000,
        }));

        mockTransaction(reorderedCards);

        const result = await reorderCardsInList(validListIdUUID, cardsWithVariousProps);

        expect(result.success).toBe(true);
        expect(result.data?.[0]?.title).toBe("High Priority Card");
        expect(result.data?.[0]?.priority).toBe("HIGH");
        expect(result.data?.[1]?.content).toBe(null);
      });
    });

    describe("Transaction failure scenarios", () => {
      it("should handle transaction failure with proper rollback", async () => {
        const transactionError = createDatabaseError("Transaction failed");
        mockPrismaClient.$transaction.mockRejectedValue(transactionError);

        const result = await reorderCardsInList(validListId, mockCards);

        expect(result).toEqual({
          success: false,
          errors: { _form: ["Something went wrong"] },
        });
      });

      it("should handle individual card update failure", async () => {
        const updateError = createDatabaseError("Card update failed");
        mockPrismaClient.$transaction.mockRejectedValue(updateError);

        const result = await reorderCardsInList(validListId, mockCards);

        expect(result).toEqual({
          success: false,
          errors: { _form: ["Something went wrong"] },
        });
      });

      it("should handle constraint violation during bulk update", async () => {
        const constraintError = createDatabaseError("Unique constraint failed");
        mockPrismaClient.$transaction.mockRejectedValue(constraintError);

        const result = await reorderCardsInList(validListId, mockCards);

        expect(result).toEqual({
          success: false,
          errors: { _form: ["Something went wrong"] },
        });
      });

      it("should log error to console", async () => {
        const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        const dbError = createDatabaseError("Bulk update failed");
        mockPrismaClient.$transaction.mockRejectedValue(dbError);

        await reorderCardsInList(validListId, mockCards);

        expect(consoleErrorSpy).toHaveBeenCalledWith("Error Sorting Card:", dbError);
        consoleErrorSpy.mockRestore();
      });
    });

    describe("Edge cases", () => {
      it("should handle cards with duplicate IDs gracefully", async () => {
        const validListIdUUID = "550e8400-e29b-41d4-a716-446655440000";
        const duplicateCards = [
          createMockCard({ id: "card-1" }),
          createMockCard({ id: "card-1" }), // Duplicate ID
        ];

        // This would typically cause the validation to fail at the schema level
        // but we'll test the transaction behavior
        const transactionError = createDatabaseError("Duplicate key constraint");
        mockPrismaClient.$transaction.mockRejectedValue(transactionError);

        const result = await reorderCardsInList(validListIdUUID, duplicateCards);

        expect(result.success).toBe(false);
        expect(result.errors?._form).toContain("Something went wrong");
      });

      it("should handle cards not belonging to the specified list", async () => {
        const validListIdUUID = "550e8400-e29b-41d4-a716-446655440000";
        const mixedCards = [
          createMockCard({ id: "card-1", listId: validListIdUUID }),
          createMockCard({ id: "card-2", listId: "different-list-id" }),
        ];

        // The function doesn't validate list ownership, but database constraints might
        const constraintError = createDatabaseError("List constraint violation");
        mockPrismaClient.$transaction.mockRejectedValue(constraintError);

        const result = await reorderCardsInList(validListIdUUID, mixedCards);

        expect(result.success).toBe(false);
        expect(result.errors?._form).toContain("Something went wrong");
      });
    });
  });

  describe("updateCardContent", () => {
    const validCardId = "550e8400-e29b-41d4-a716-446655440000";

    beforeEach(() => {
      mockAuth.mockResolvedValue(mockAuthSession());
    });

    describe("Authentication scenarios", () => {
      it("should fail when user is not authenticated", async () => {
        mockAuth.mockResolvedValue(null);

        const result = await updateCardContent(validCardId, { title: "New Title" });

        expect(result).toEqual({
          success: false,
          errors: { _form: ["Not authenticated"] },
        });
        expect(mockPrismaClient.card.update).not.toHaveBeenCalled();
      });

      it("should fail when session has no user", async () => {
        mockAuth.mockResolvedValue({ user: null });

        const result = await updateCardContent(validCardId, { title: "New Title" });

        expect(result).toEqual({
          success: false,
          errors: { _form: ["Not authenticated"] },
        });
      });

      it("should fail when session user has no id", async () => {
        mockAuth.mockResolvedValue({ user: {} });

        const result = await updateCardContent(validCardId, { content: "New Content" });

        expect(result).toEqual({
          success: false,
          errors: { _form: ["Not authenticated"] },
        });
      });
    });

    describe("Validation scenarios", () => {
      it("should fail with invalid cardId (not UUID)", async () => {
        const result = await updateCardContent("invalid-card-id", { title: "New Title" });

        expect(result.success).toBe(false);
        expect(result.errors?.cardId).toContain("Invalid card ID");
      });

      it("should fail with empty title", async () => {
        const result = await updateCardContent(validCardId, { title: "" });

        expect(result.success).toBe(false);
        expect(result.errors?.title).toContain("Title cannot be empty");
      });

      it("should fail with title too long", async () => {
        const longTitle = "A".repeat(101);
        const result = await updateCardContent(validCardId, { title: longTitle });

        expect(result.success).toBe(false);
        expect(result.errors?.title).toContain("Title must be less than 100 characters");
      });

      it("should succeed with valid title", async () => {
        const mockCard = createMockCard({
          id: validCardId,
          title: "Valid Title",
        });
        mockPrismaClient.card.update.mockResolvedValue(mockCard);

        const result = await updateCardContent(validCardId, { title: "Valid Title" });

        expect(result.success).toBe(true);
        expect(result.data?.title).toBe("Valid Title");
      });

      it("should succeed with valid content", async () => {
        const mockCard = createMockCard({
          id: validCardId,
          content: "Valid content",
        });
        mockPrismaClient.card.update.mockResolvedValue(mockCard);

        const result = await updateCardContent(validCardId, { content: "Valid content" });

        expect(result.success).toBe(true);
        expect(result.data?.content).toBe("Valid content");
      });
    });

    describe("Update scenarios", () => {
      it("should update only title when provided", async () => {
        const mockCard = createMockCard({
          id: validCardId,
          title: "Updated Title",
        });
        mockPrismaClient.card.update.mockResolvedValue(mockCard);

        const result = await updateCardContent(validCardId, { title: "Updated Title" });

        expect(result.success).toBe(true);
        expect(mockPrismaClient.card.update).toHaveBeenCalledWith({
          where: { id: validCardId },
          data: { title: "Updated Title" },
        });
      });

      it("should update only content when provided", async () => {
        const mockCard = createMockCard({
          id: validCardId,
          content: "Updated content",
        });
        mockPrismaClient.card.update.mockResolvedValue(mockCard);

        const result = await updateCardContent(validCardId, { content: "Updated content" });

        expect(result.success).toBe(true);
        expect(mockPrismaClient.card.update).toHaveBeenCalledWith({
          where: { id: validCardId },
          data: { content: "Updated content" },
        });
      });

      it("should update both title and content when provided", async () => {
        const mockCard = createMockCard({
          id: validCardId,
          title: "Updated Title",
          content: "Updated content",
        });
        mockPrismaClient.card.update.mockResolvedValue(mockCard);

        const result = await updateCardContent(validCardId, {
          title: "Updated Title",
          content: "Updated content",
        });

        expect(result.success).toBe(true);
        expect(mockPrismaClient.card.update).toHaveBeenCalledWith({
          where: { id: validCardId },
          data: {
            title: "Updated Title",
            content: "Updated content",
          },
        });
      });

      it("should handle content set to null", async () => {
        const mockCard = createMockCard({
          id: validCardId,
          content: null,
        });
        mockPrismaClient.card.update.mockResolvedValue(mockCard);

        const result = await updateCardContent(validCardId, { content: undefined });

        expect(result.success).toBe(true);
        expect(mockPrismaClient.card.update).toHaveBeenCalledWith({
          where: { id: validCardId },
          data: {},
        });
      });

      it("should handle empty content string", async () => {
        const mockCard = createMockCard({
          id: validCardId,
          content: "",
        });
        mockPrismaClient.card.update.mockResolvedValue(mockCard);

        const result = await updateCardContent(validCardId, { content: "" });

        expect(result.success).toBe(true);
        expect(mockPrismaClient.card.update).toHaveBeenCalledWith({
          where: { id: validCardId },
          data: { content: "" },
        });
      });
    });

    describe("Success scenarios", () => {
      it("should return success response with updated card", async () => {
        const mockCard = createMockCard({
          id: validCardId,
          title: "New Title",
          content: "New Content",
        });
        mockPrismaClient.card.update.mockResolvedValue(mockCard);

        const result = await updateCardContent(validCardId, {
          title: "New Title",
          content: "New Content",
        });

        expect(result).toEqual({
          success: true,
          data: mockCard,
          message: "Card updated successfully",
        });
      });

      it("should handle very long content", async () => {
        const longContent = "A".repeat(5000);
        const mockCard = createMockCard({
          id: validCardId,
          content: longContent,
        });
        mockPrismaClient.card.update.mockResolvedValue(mockCard);

        const result = await updateCardContent(validCardId, { content: longContent });

        expect(result.success).toBe(true);
        expect(result.data?.content).toBe(longContent);
      });

      it("should handle special characters in content", async () => {
        const specialContent = "Content with special chars: !@#$%^&*(){}[]|\\:;\"'<>,.?/`~";
        const mockCard = createMockCard({
          id: validCardId,
          content: specialContent,
        });
        mockPrismaClient.card.update.mockResolvedValue(mockCard);

        const result = await updateCardContent(validCardId, { content: specialContent });

        expect(result.success).toBe(true);
        expect(result.data?.content).toBe(specialContent);
      });
    });

    describe("Database error scenarios", () => {
      it("should handle database update failure", async () => {
        const dbError = createDatabaseError("Card not found");
        mockPrismaClient.card.update.mockRejectedValue(dbError);

        const result = await updateCardContent(validCardId, { title: "New Title" });

        expect(result).toEqual({
          success: false,
          errors: { _form: ["Something went wrong"] },
        });
      });

      it("should handle constraint violation", async () => {
        const constraintError = createDatabaseError("Title constraint failed");
        mockPrismaClient.card.update.mockRejectedValue(constraintError);

        const result = await updateCardContent(validCardId, { title: "New Title" });

        expect(result).toEqual({
          success: false,
          errors: { _form: ["Something went wrong"] },
        });
      });

      it("should log error to console", async () => {
        const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        const dbError = createDatabaseError("Update failed");
        mockPrismaClient.card.update.mockRejectedValue(dbError);

        await updateCardContent(validCardId, { title: "New Title" });

        expect(consoleErrorSpy).toHaveBeenCalledWith("Error updating card content:", dbError);
        consoleErrorSpy.mockRestore();
      });
    });

    describe("Edge cases", () => {
      it("should handle empty updates object", async () => {
        const mockCard = createMockCard({ id: validCardId });
        mockPrismaClient.card.update.mockResolvedValue(mockCard);

        const result = await updateCardContent(validCardId, {});

        expect(result.success).toBe(true);
        expect(mockPrismaClient.card.update).toHaveBeenCalledWith({
          where: { id: validCardId },
          data: {},
        });
      });

      it("should handle non-existent card gracefully", async () => {
        const notFoundError = new Error("Card not found");
        notFoundError.name = "NotFoundError";
        mockPrismaClient.card.update.mockRejectedValue(notFoundError);

        const result = await updateCardContent(validCardId, { title: "New Title" });

        expect(result.success).toBe(false);
        expect(result.errors?._form).toContain("Something went wrong");
      });

      it("should handle undefined values correctly", async () => {
        const mockCard = createMockCard({ id: validCardId });
        mockPrismaClient.card.update.mockResolvedValue(mockCard);

        const result = await updateCardContent(validCardId, {
          title: undefined,
          content: undefined,
        });

        expect(result.success).toBe(true);
        expect(mockPrismaClient.card.update).toHaveBeenCalledWith({
          where: { id: validCardId },
          data: {},
        });
      });

      it("should handle updates with whitespace-only title", async () => {
        const result = await updateCardContent(validCardId, { title: "   " });

        expect(result.success).toBe(true);
        // Note: Zod doesn't trim by default, so whitespace-only strings are valid unless explicitly configured
      });

      it("should handle concurrent update attempts", async () => {
        const mockCard = createMockCard({
          id: validCardId,
          title: "Updated Title",
        });
        mockPrismaClient.card.update.mockResolvedValue(mockCard);

        const [result1, result2] = await Promise.all([
          updateCardContent(validCardId, { title: "Updated Title" }),
          updateCardContent(validCardId, { content: "Updated Content" }),
        ]);

        expect(result1.success).toBe(true);
        expect(result2.success).toBe(true);
        expect(mockPrismaClient.card.update).toHaveBeenCalledTimes(2);
      });
    });
  });
});
