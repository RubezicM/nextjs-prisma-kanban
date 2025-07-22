"use server";

import { auth } from "@/auth";
import prisma from "@/db/prisma";
import { Card } from "@/types/database";
import { ZodError } from "zod";

import { revalidatePath } from "next/cache";

import { createCardSchema } from "@/lib/validators";

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
  console.log(formData);
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

    console.log("tu smo 4");

    const { title, content, listId, boardSlug } = validatedFields;
    console.log("Creating card with data:", validatedFields);
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
    console.log("Error creating card:", error);
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
    console.error(error); // Re-throw unexpected errors

    return { success: false, errors: { _form: ["Something went wrong"] } };
  }
}
