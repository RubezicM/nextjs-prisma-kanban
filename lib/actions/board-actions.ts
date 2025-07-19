"use server";

import { auth } from "@/auth";
import prisma from "@/db/prisma";
import type { Board, BoardWithData } from "@/types/database";
import { ZodError } from "zod";

import { revalidatePath } from "next/cache";

import { APP_LIMITS, WORKSPACE_LISTS, INITIAL_CARDS, LIST_TYPES } from "@/lib/constants/config";
import { createBoardSchema } from "@/lib/validators";

export async function getUserBoards(userId: string): Promise<Board[]> {
  return await prisma.board.findMany({
    where: {
      userId: userId,
    },
    include: {
      lists: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export type CreateBoardState = {
  errors?: {
    title?: string[];
    slug?: string[];
    _form?: string[];
  };
  data?: Board;
  success: boolean;
  message?: string;
  redirectTo?: string;
} | null;

export async function createBoard(
  prevState: unknown,
  formData: FormData
): Promise<CreateBoardState> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        errors: { _form: ["Not authenticated"] },
      };
    }

    const userBoardCount = await prisma.board.count({
      where: { userId: session.user.id },
    });

    if (userBoardCount >= APP_LIMITS.MAX_BOARDS_PER_USER) {
      return {
        success: false,
        errors: { _form: ["Maximum 2 boards allowed"] },
      };
    }

    const result = createBoardSchema.parse({
      title: formData.get("title"),
      slug: formData.get("slug"),
    });

    // 3. Check slug uniqueness

    const existingBoard = await prisma.board.findFirst({
      where: {
        userId: session.user.id,
        slug: result.slug,
      },
    });

    // board exists, return error

    if (existingBoard) {
      return {
        success: false,
        errors: { slug: ["This URL is already taken"] },
      };
    }

    // atomic transaction to create board and lists
    const board = await prisma.$transaction(async tx => {
      // 1. Create board
      const board = await tx.board.create({
        data: {
          title: result.title,
          slug: result.slug,
          userId: session.user.id,
        },
      });

      // 2. Create lists
      const listsData = WORKSPACE_LISTS.map(template => ({
        title: template.title,
        boardId: board.id,
        type: template.id,
        order: template.order,
      }));

      await tx.list.createMany({ data: listsData });

      const todoList = await tx.list.findFirst({
        where: {
          boardId: board.id,
          type: LIST_TYPES.TODO,
        },
        select: { id: true },
      });

      if (!todoList) {
        throw new Error("Todo list not found");
      }

      const cardData = INITIAL_CARDS.map((card, index) => ({
        title: card.title,
        content: card.content,
        listId: todoList.id,
        order: (index + 1) * 1000,
      }));

      // Create initial cards in the second list (Todo)
      await tx.card.createMany({ data: cardData });
      // 3. Return board if all ok
      return board;
    });

    // revalidate paths to update cache
    revalidatePath("/join");
    revalidatePath(`/board/${result.slug}`);

    // ultimate success with redirect
    return {
      success: true,
      data: board,
      message: "Board created successfully",
      redirectTo: `/board/${result.slug}`,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldErrors = error.flatten().fieldErrors;
      return {
        success: false,
        errors: {
          title: fieldErrors.title,
          slug: fieldErrors.slug,
        },
      };
    }
    return { success: false, errors: { _form: ["Something went wrong"] } };
  }
}

export async function getBoardBySlug(userId: string, slug: string): Promise<BoardWithData | null> {
  return await prisma.board.findFirst({
    where: { userId, slug },
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
}

export async function createDefaultBoard(userId: string): Promise<Board> {
  // Create a default board for the user
  const board = await prisma.board.create({
    data: {
      title: "Untitled Board",
      slug: "untitled-board",
      userId: userId,
    },
  });

  // Create default lists for the board
  await prisma.list.createMany({
    data: [
      { title: "To Do", boardId: board.id, order: 1 },
      { title: "In Progress", boardId: board.id, order: 2 },
      { title: "Done", boardId: board.id, order: 3 },
    ],
  });

  return board;
}
