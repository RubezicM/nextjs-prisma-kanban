"use client";

import { BoardWithData } from "@/types/database";
import { useQuery } from "@tanstack/react-query";

import { createContext, useContext, ReactNode, useMemo } from "react";

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
  const queryKey = useMemo(() => ["board", initialData.slug, userId], [initialData.slug, userId]);
  const boardQuery = useQuery({
    queryKey,
    queryFn: () => getBoardBySlug(userId, initialData.slug),
    initialData,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const contextValue = useMemo(
    () => ({
      boardData: boardQuery.data ?? undefined,
      isLoading: boardQuery.isLoading,
    }),
    [boardQuery.data, boardQuery.isLoading]
  );

  return <BoardContext.Provider value={contextValue}>{children}</BoardContext.Provider>;
};

export const useBoardContext = () => {
  const context = useContext(BoardContext);
  if (!context) throw new Error("useBoardContext must be used within BoardProvider");
  return context;
};
