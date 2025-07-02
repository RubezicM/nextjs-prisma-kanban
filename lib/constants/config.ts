// lib/constants/workspace-config.ts
export const LIST_TYPES = {
    BACKLOG: 'backlog',
    TODO: 'todo',
    IN_PROGRESS: 'in-progress',
    DONE: 'done',
    CANCELED: 'canceled'
} as const

export type ListType = typeof LIST_TYPES[keyof typeof LIST_TYPES]

export function isValidListType(type: string): type is ListType {
    return Object.values(LIST_TYPES).includes(type as ListType)
}

export const WORKSPACE_LISTS = [
    {
        id: LIST_TYPES.BACKLOG,
        title: 'Backlog',
        icon: 'circle-dashed',
        color: 'text-gray-500',
        collapsible: true
    },
    {
        id: LIST_TYPES.TODO,
        title: 'Todo',
        icon: 'circle-full',
        color: 'text-blue-500',
        collapsible: true
    },
    {
        id: LIST_TYPES.IN_PROGRESS,
        title: 'In Progress',
        icon: 'clock',
        color: 'text-yellow-500',
        collapsible: true
    },
    {
        id: LIST_TYPES.DONE,
        title: 'Done',
        icon: 'check-circle',
        color: 'text-green-500',
        collapsible: true
    },
    {
        id: LIST_TYPES.CANCELED,
        title: 'Canceled',
        icon: 'x-circle',
        color: 'text-red-500',
        collapsible: true
    }
] as const
