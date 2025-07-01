// types/database.ts
export interface Board {
    id: string
    title: string
    slug: string
    userId: string
    createdAt: Date
    updatedAt: Date
}

export interface List {
    id: string
    title: string
    boardId: string
    order: number
    createdAt: Date
    updatedAt: Date
}

export interface Card {
    id: string
    title: string
    content: string | null
    listId: string
    order: number
    createdAt: Date
    updatedAt: Date
}
