'use client'

import { useMutation } from "@tanstack/react-query";
import { createDefaultBoard } from "@/lib/actions/board-actions";
import { useRouter } from "next/navigation" // ✅ Client router

export function useCreateDefaultBoard() {
    const router = useRouter()
    return useMutation({
        mutationFn: (userId: string) => createDefaultBoard(userId),
        onSuccess: (board) => {
            router.push(`/board/${board.slug}`) // ✅ Client redirect
        },
    })
}
