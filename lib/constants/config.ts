// lib/constants/workspace-config.ts
export const LIST_TYPES = {
    BACKLOG: 'BACKLOG',
    TODO: 'TODO',
    IN_PROGRESS: 'IN_PROGRESS',
    DONE: 'DONE',
    CANCELED: 'CANCELED'
} as const

export type ListType = typeof LIST_TYPES[keyof typeof LIST_TYPES]

export function isValidListType(type: string): type is ListType {
    return Object.values(LIST_TYPES).includes(type as ListType)
}

export const APP_LIMITS = {
    MAX_BOARDS_PER_USER: 2,
    MAX_LISTS_PER_BOARD: 5,
    MAX_CARDS_PER_LIST: 50,
    MAX_BOARD_TITLE_LENGTH: 30,
    MAX_SLUG_LENGTH: 40,
    RATE_LIMIT_CARDS_PER_MINUTE: 10
} as const

export const INITIAL_CARDS = [
    {
        title: 'Sample Card #1',
        content: 'This is a sample card content.',
    },
    {
        title: 'Sample Card #2',
        content: 'This is another sample card content.',
    },
    {
        title: 'Sample Card #3',
        content: 'This is yet another sample card content.',
    }
] as const


export const WORKSPACE_LISTS = [
    {
        id: LIST_TYPES.BACKLOG,
        title: 'Backlog',
        icon: 'circle-dashed',
        color: 'bg-gray-500',
        order: 0
    },
    {
        id: LIST_TYPES.TODO,
        title: 'Todo',
        icon: 'bg-circle-full',
        color: 'bg-blue-500',
        order: 1
    },
    {
        id: LIST_TYPES.IN_PROGRESS,
        title: 'In Progress',
        icon: 'clock',
        color: 'bg-yellow-500',
        order: 2
    },
    {
        id: LIST_TYPES.DONE,
        title: 'Done',
        icon: 'check-circle',
        color: 'bg-green-500',
        order: 3
    },
    {
        id: LIST_TYPES.CANCELED,
        title: 'Canceled',
        icon: 'x-circle',
        color: 'bg-red-500',
        order: 4
    }
] as const
