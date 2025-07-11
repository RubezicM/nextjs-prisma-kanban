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


export const WORKSPACE_LISTS = [
    {
        id: LIST_TYPES.BACKLOG,
        title: 'Backlog',
        icon: 'circle-dashed',
        color: 'text-gray-500',
        order: 0
    },
    {
        id: LIST_TYPES.TODO,
        title: 'Todo',
        icon: 'circle-full',
        color: 'text-blue-500',
        order: 1
    },
    {
        id: LIST_TYPES.IN_PROGRESS,
        title: 'In Progress',
        icon: 'clock',
        color: 'text-yellow-500',
        order: 2
    },
    {
        id: LIST_TYPES.DONE,
        title: 'Done',
        icon: 'check-circle',
        color: 'text-green-500',
        order: 3
    },
    {
        id: LIST_TYPES.CANCELED,
        title: 'Canceled',
        icon: 'x-circle',
        color: 'text-red-500',
        order: 4
    }
] as const
