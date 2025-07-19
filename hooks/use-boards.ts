"use client";

import type { Board } from "@/types/database";
import { useMutation } from "@tanstack/react-query";

import { useRouter } from "next/navigation";

import { createDefaultBoard } from "@/lib/actions/board-actions";

export function useCreateDefaultBoard() {
  const router = useRouter();
  return useMutation<Board, Error, string>({
    mutationFn: (userId: string) => createDefaultBoard(userId),
    onSuccess: board => {
      router.push(`/board/${board.slug}`);
    },
  });
}
