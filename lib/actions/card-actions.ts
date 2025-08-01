"use server";

import { auth } from "@/auth";
import prisma from "@/db/prisma";
import { Card } from "@/types/database";
import { ZodError } from "zod";

import { revalidatePath } from "next/cache";

import {
  createCardSchema,
  moveCardToColumnSchema,
  sortCardInListSchema,
  updateCardPrioritySchema,
  updateCardContentSchema,
} from "@/lib/validators";

export type CreateCardState = {
  success: boolean;
  errors?: {
    title?: string[];
    content?: string[];
    boardSlug?: string[];
    listId?: string[];
    _form?: string[];
  };
  data?: Card;
  message?: string;
};

export async function createCard(
  prevState: CreateCardState,
  formData: FormData
): Promise<CreateCardState> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        errors: { _form: ["Not authenticated"] },
      };
    }

    const validatedFields = createCardSchema.parse({
      title: formData.get("title"),
      content: formData.get("content"),
      listId: formData.get("listId"),
      boardSlug: formData.get("boardSlug"),
    });

    const { title, content, listId, boardSlug } = validatedFields;
    const result = await prisma.$transaction(async tx => {
      // Find max order in this list
      const maxOrder = await tx.card.aggregate({
        where: { listId },
        _max: { order: true },
      });

      const newOrder = (maxOrder._max.order || 0) + 1000;

      return tx.card.create({
        data: {
          title,
          content,
          listId,
          order: newOrder,
        },
      });
    });

    revalidatePath(`/board/${boardSlug}`, "layout");

    return { success: true, data: result, message: "Card created successfully" };
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldErrors = error.flatten().fieldErrors;
      return {
        success: false,
        errors: {
          title: fieldErrors.title,
          content: fieldErrors.content,
          listId: fieldErrors.listId,
          boardSlug: fieldErrors.boardSlug,
        },
      };
    }

    return { success: false, errors: { _form: ["Something went wrong"] } };
  }
}

export type UpdateCardPriorityState = {
  success: boolean;
  errors?: {
    cardId?: string[];
    priority?: string[];
    _form?: string[];
  };
  data?: Card;
  message?: string;
};

export async function updateCardPriority(
  cardId: string,
  priority: Card["priority"]
): Promise<UpdateCardPriorityState> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        errors: { _form: ["Not authenticated"] },
      };
    }

    const validatedFields = updateCardPrioritySchema.parse({
      cardId,
      priority,
    });

    const updatedCard = await prisma.card.update({
      where: { id: validatedFields.cardId },
      data: { priority: validatedFields.priority },
    });

    return {
      success: true,
      data: updatedCard,
      message: "Card priority updated successfully",
    };
  } catch (error) {
    console.error("Error updating card priority:", error);
    if (error instanceof ZodError) {
      const fieldErrors = error.flatten().fieldErrors;
      return {
        success: false,
        errors: {
          cardId: fieldErrors.cardId,
          priority: fieldErrors.priority,
        },
      };
    }

    return { success: false, errors: { _form: ["Something went wrong"] } };
  }
}

export type MoveCardToColumnState = {
  success: boolean;
  errors?: {
    cardId?: string[];
    listId?: string[];
    _form?: string[];
  };
  data?: Card;
  message?: string;
};

export async function moveCardToColumn(
  cardId: string,
  listId: string
): Promise<MoveCardToColumnState> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        errors: { _form: ["Not authenticated"] },
      };
    }

    const validatedFields = moveCardToColumnSchema.parse({
      cardId,
      listId,
    });
    const updatedCard = await prisma.$transaction(async tx => {
      const maxOrder = await tx.card.aggregate({
        where: { listId: validatedFields.listId },
        _max: { order: true },
      });
      const newOrder = (maxOrder._max.order || 0) + 1000;

      return await tx.card.update({
        where: { id: validatedFields.cardId },
        data: {
          listId: validatedFields.listId,
          order: newOrder,
        },
      });
    });

    return {
      success: true,
      data: updatedCard,
      message: "Card moved to column successfully",
    };
  } catch (error) {
    console.error("Error moving card to column:", error);
    if (error instanceof ZodError) {
      const fieldErrors = error.flatten().fieldErrors;
      return {
        success: false,
        errors: {
          cardId: fieldErrors.cardId,
          listId: fieldErrors.listId,
        },
      };
    }

    return { success: false, errors: { _form: ["Something went wrong"] } };
  }
}

export type ReorderCardsInListState = {
  success: boolean;
  errors?: {
    reorderedCards?: string[];
    _form?: string[];
  };
  data?: Card[];
  message?: string;
};

export async function reorderCardsInList(
  listId: string,
  reorderedCards: Card[]
): Promise<ReorderCardsInListState> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        errors: { _form: ["Not authenticated"] },
      };
    }
    const orderedCardIds = reorderedCards.map(card => card.id);
    const validatedFields = sortCardInListSchema.parse({
      listId,
      orderedCardIds,
    });

    if (validatedFields.orderedCardIds.length === 0)
      return { success: false, errors: { reorderedCards: ["No cards to reorder"] } };

    // prepare updates array with prisma update rules/calls
    const updates = validatedFields.orderedCardIds.map((cardId, index) => ({
      where: { id: cardId },
      data: { order: (index + 1) * 1000 },
    }));

    const update = await prisma.$transaction(
      updates.map(update =>
        prisma.card.update({
          where: update.where,
          data: update.data,
        })
      )
    );

    return {
      success: true,
      data: update,
      message: "Card sorted successfully",
    };
  } catch (error) {
    console.error("Error Sorting Card:", error);
    if (error instanceof ZodError) {
      const fieldErrors = error.flatten().fieldErrors;
      return {
        success: false,
        errors: {
          reorderedCards: fieldErrors.orderedCardIds,
        },
      };
    }

    return { success: false, errors: { _form: ["Something went wrong"] } };
  }
}

export type UpdateCardContentState = {
  success: boolean;
  errors?: {
    cardId?: string[];
    title?: string[];
    content?: string[];
    _form?: string[];
  };
  data?: Card;
  message?: string;
};

export async function updateCardContent(
  cardId: string,
  updates: { title?: string; content?: string }
): Promise<UpdateCardContentState> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        errors: { _form: ["Not authenticated"] },
      };
    }

    const validatedFields = updateCardContentSchema.parse({
      cardId,
      ...updates,
    });

    const dataToUpdate: { title?: string; content?: string } = {};
    if (validatedFields.title !== undefined) {
      dataToUpdate.title = validatedFields.title;
    }
    if (validatedFields.content !== undefined) {
      dataToUpdate.content = validatedFields.content;
    }

    const updatedCard = await prisma.card.update({
      where: { id: validatedFields.cardId },
      data: dataToUpdate,
    });

    return {
      success: true,
      data: updatedCard,
      message: "Card updated successfully",
    };
  } catch (error) {
    console.error("Error updating card content:", error);
    if (error instanceof ZodError) {
      const fieldErrors = error.flatten().fieldErrors;
      return {
        success: false,
        errors: {
          cardId: fieldErrors.cardId,
          title: fieldErrors.title,
          content: fieldErrors.content,
        },
      };
    }

    return { success: false, errors: { _form: ["Something went wrong"] } };
  }
}
