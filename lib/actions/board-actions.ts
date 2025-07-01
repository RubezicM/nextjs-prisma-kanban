"use server"

import prisma from "@/db/prisma";

import type { Board } from "@/types/database"

export async function getUserBoards(userId: string): Promise<Board[]> {

    return await prisma.board.findMany({
        where: {
            userId: userId,
        },
        include: {
            lists: true,
        },
        orderBy: { createdAt: 'desc' }
    })

}

export async function createDefaultBoard(userId: string):Promise<Board> {
    // Create a default board for the user
    const board = await prisma.board.create({
        data: {
            title: 'Untitled Board',
            slug:'untitled-board',
            userId: userId
        },
    });

    // Create default lists for the board
    await prisma.list.createMany({
        data: [
            { title: 'To Do', boardId: board.id, order: 1 },
            { title: 'In Progress', boardId: board.id, order: 2 },
            { title: 'Done', boardId: board.id, order: 3 },
        ],
    });

    return board;
}
