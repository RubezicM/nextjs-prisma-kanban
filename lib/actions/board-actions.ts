"use server"

import prisma from "@/db/prisma";
import { createBoardSchema } from "@/lib/validators";
import type { Board } from "@/types/database"
import { ZodError } from "zod";

export async function getUserBoards(userId: string): Promise<Board[]> {

    return await prisma.board.findMany({
        where: {
            userId: userId,
        },
        include: {
            lists: true,
        },
        orderBy: {createdAt: 'desc'}
    })

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
} | null;

export async function createBoard(prevState: unknown,formData: FormData): Promise<CreateBoardState> {
    try {
        const user = createBoardSchema.parse({
            title: formData.get("title"),
            slug: formData.get("slug"),
        });

        // ovde radimo kreaciju boarda preko prisme

        return {success: true, message: "Signed in successfully"};
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
    }
}

export async function createDefaultBoard(userId: string): Promise<Board> {
    // Create a default board for the user
    const board = await prisma.board.create({
        data: {
            title: 'Untitled Board',
            slug: 'untitled-board',
            userId: userId
        },
    });

    // Create default lists for the board
    await prisma.list.createMany({
        data: [
            {title: 'To Do', boardId: board.id, order: 1},
            {title: 'In Progress', boardId: board.id, order: 2},
            {title: 'Done', boardId: board.id, order: 3},
        ],
    });

    return board;
}
