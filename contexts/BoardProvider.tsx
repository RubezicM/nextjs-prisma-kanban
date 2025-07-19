"use client";

import { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { BoardWithData } from "@/types/database";
import { getBoardBySlug } from "@/lib/actions/board-actions";

type BoardContextType = {
  boardData: BoardWithData | undefined;
  isLoading: boolean;
} | null;

const BoardContext = createContext<BoardContextType | null>(null);

type BoardProviderProps = {
  children: ReactNode;
  initialData: BoardWithData;
  userId: string;
};

export const BoardProvider = ({ children, initialData, userId }: BoardProviderProps) => {
  const boardQuery = useQuery({
    queryKey: ["board", initialData.slug, userId],
    queryFn: () => getBoardBySlug(userId, initialData.slug),
    initialData,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  return (
    <BoardContext.Provider
      value={{
        boardData: boardQuery.data ?? undefined,
        isLoading: boardQuery.isLoading,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
};

export const useBoardContext = () => {
  const context = useContext(BoardContext);
  if (!context) throw new Error("useBoardContext must be used within BoardProvider");
  return context;
};
