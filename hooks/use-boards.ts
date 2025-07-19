"use client";

import { useMutation } from "@tanstack/react-query";
import { createDefaultBoard } from "@/lib/actions/board-actions";
import { useRouter } from "next/navigation";
import type { Board } from "@/types/database";

export function useCreateDefaultBoard() {
  const router = useRouter();
  return useMutation<Board, Error, string>({
    mutationFn: (userId: string) => createDefaultBoard(userId),
    onSuccess: board => {
      router.push(`/board/${board.slug}`);
    },
  });
}
