"use client";

import { BoardWithData, Card } from "@/types/database";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { createContext, useContext, ReactNode, useMemo, useCallback } from "react";

import { getBoardBySlug } from "@/lib/actions/board-actions";

type BoardContextType = {
  boardData: BoardWithData | undefined;
  isLoading: boolean;
  updateCardPositionOptimistic: (cardId: string, fromListId: string, toListId: string) => void;
} | null;

const BoardContext = createContext<BoardContextType | null>(null);

type BoardProviderProps = {
  children: ReactNode;
  initialData: BoardWithData;
  userId: string;
};

export const BoardProvider = ({ children, initialData, userId }: BoardProviderProps) => {
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => ["board", initialData.slug, userId], [initialData.slug, userId]);
  const boardQuery = useQuery({
    queryKey,
    queryFn: () => getBoardBySlug(userId, initialData.slug),
    initialData,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const updateCardPositionOptimistic = useCallback(
    (cardId: string, fromListId: string, toListId: string) => {
      queryClient.setQueryData(queryKey, (oldData: BoardWithData | undefined) => {
        if (!oldData?.lists) return oldData;

        let cardToMove: Card | null = null;

        const updatedLists = oldData.lists.map(list => {
          if (list.id === fromListId) {
            // remove card from old list
            const cardIndex = list.cards.findIndex(card => card.id === cardId);
            if (cardIndex !== -1) {
              cardToMove = list.cards[cardIndex];
              return {
                ...list,
                cards: list.cards.filter(card => card.id !== cardId),
              };
            }
          }
          return list;
        });

        // add card to target list
        const finalLists = updatedLists.map(list => {
          if (list.id === toListId && cardToMove) {
            return {
              ...list,
              cards: [...list.cards, cardToMove],
            };
          }
          return list;
        });

        return {
          ...oldData,
          lists: finalLists,
        };
      });
    },
    [queryClient, queryKey]
  );

  const contextValue = useMemo(
    () => ({
      boardData: boardQuery.data ?? undefined,
      isLoading: boardQuery.isLoading,
      updateCardPositionOptimistic,
    }),
    [boardQuery.data, boardQuery.isLoading, updateCardPositionOptimistic]
  );

  return <BoardContext.Provider value={contextValue}>{children}</BoardContext.Provider>;
};

export const useBoardContext = () => {
  const context = useContext(BoardContext);
  if (!context) throw new Error("useBoardContext must be used within BoardProvider");
  return context;
};
