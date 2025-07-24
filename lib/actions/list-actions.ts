"use server";

import { auth } from "@/auth";
import prisma from "@/db/prisma";
import { z } from "zod";

import { revalidatePath } from "next/cache";

const toggleListCollapsedSchema = z.object({
  listId: z.string().uuid("Invalid list ID"),
  collapsed: z.boolean(),
});

export type ToggleListCollapsedState = {
  success: boolean;
  errors?: {
    listId?: string[];
    collapsed?: string[];
    _form?: string[];
  };
  data?: { id: string; collapsed: boolean };
  message?: string;
};

export async function toggleListCollapsed(
  listId: string,
  collapsed: boolean
): Promise<ToggleListCollapsedState> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        errors: { _form: ["Not authenticated"] },
      };
    }

    const validatedFields = toggleListCollapsedSchema.parse({
      listId,
      collapsed,
    });

    const updatedList = await prisma.list.update({
      where: { id: validatedFields.listId },
      data: { collapsed: validatedFields.collapsed },
    });

    // Revalidate the board page
    revalidatePath("/board/[slug]", "page");

    return {
      success: true,
      data: updatedList,
      message: `List ${collapsed ? "hidden" : "restored"} successfully`,
    };
  } catch (error) {
    console.error("Error toggling list collapsed state:", error);
    if (error instanceof z.ZodError) {
      const fieldErrors = error.flatten().fieldErrors;
      return {
        success: false,
        errors: {
          listId: fieldErrors.listId,
          collapsed: fieldErrors.collapsed,
        },
      };
    }

    return { success: false, errors: { _form: ["Something went wrong"] } };
  }
}
