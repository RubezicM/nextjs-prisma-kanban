// hooks/use-cards.ts
import { useBoardContext } from "@/contexts/BoardProvider";
import { BoardWithData, List, Card } from "@/types/database";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createCard,
  moveCardToColumn,
  reorderCardsInList,
  updateCardPriority,
} from "@/lib/actions/card-actions";

export function useCreateCard(listId: string) {
  const queryClient = useQueryClient();
  const { boardData } = useBoardContext();

  const boardSlug = boardData?.slug;
  const userId = boardData?.userId;

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await createCard({ success: false }, formData);
      if (!result.success) throw new Error(result.errors?._form?.[0] || "Failed");
      return result;
    },

    onMutate: async (formData: FormData) => {
      if (!boardSlug || !userId) return {};

      const title = formData.get("title") as string;
      const content = formData.get("content") as string;

      // ⭐️ Use existing query key format
      const queryKey = ["board", boardSlug, userId];

      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<BoardWithData>(queryKey);

      const tempId = `temp-${Date.now()}`;
      // Optimistic update
      queryClient.setQueryData<BoardWithData>(queryKey, old => {
        if (!old) return old;

        const targetList = old.lists.find((list: List) => list.id === listId);
        if (!targetList) return old;

        const existingCards = targetList.cards || [];
        const maxOrder =
          existingCards.length > 0 ? Math.max(...existingCards.map((card: Card) => card.order)) : 0;

        const newOrder = maxOrder + 1000;
        const tempCard: Card = {
          id: tempId,
          title,
          content,
          listId,
          order: newOrder,
          priority: "NONE",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        return {
          ...old,
          lists: old.lists.map((list: List) =>
            list.id === listId ? { ...list, cards: [...list.cards, tempCard] } : list
          ),
        };
      });

      return { previousData, queryKey, tempId };
    },

    onError: (err, variables, context) => {
      if (context?.previousData && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousData);
        // Only invalidate on error to get fresh data
        queryClient.invalidateQueries({ queryKey: context.queryKey });
      }
    },

    onSuccess: (data, variables, context) => {
      // Replace temp card!!
      if (boardSlug && userId && context?.queryKey && data.success && data.data) {
        const queryKey = context.queryKey;
        queryClient.setQueryData<BoardWithData>(queryKey, old => {
          if (!old) return old;

          return {
            ...old,
            lists: old.lists.map((list: List) =>
              list.id === listId
                ? {
                    ...list,
                    cards: list.cards.map(card =>
                      card.id === context.tempId ? (data.data as Card) : card
                    ),
                  }
                : list
            ),
          };
        });
      }
    },
  });
}

export function useUpdateCardPriority() {
  const queryClient = useQueryClient();
  const { boardData } = useBoardContext();

  const boardSlug = boardData?.slug;
  const userId = boardData?.userId;

  return useMutation({
    mutationFn: async ({ cardId, priority }: { cardId: string; priority: Card["priority"] }) => {
      const result = await updateCardPriority(cardId, priority);
      if (!result.success) throw new Error(result.errors?._form?.[0] || "Failed");
      return result;
    },

    onMutate: async ({ cardId, priority }) => {
      if (!boardSlug || !userId) return {};

      const queryKey = ["board", boardSlug, userId];

      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<BoardWithData>(queryKey);

      // OU
      queryClient.setQueryData<BoardWithData>(queryKey, old => {
        if (!old) return old;

        const listIndex = old.lists.findIndex(list => list.cards.some(card => card.id === cardId));

        if (listIndex === -1) return old;

        // Create new lists array
        const newLists = [...old.lists];
        newLists[listIndex] = {
          ...old.lists[listIndex],
          cards: old.lists[listIndex].cards.map((card: Card) =>
            card.id === cardId ? { ...card, priority } : card
          ),
        };

        return {
          ...old,
          lists: newLists,
        };
      });

      return { previousData, queryKey };
    },

    onError: (err, variables, context) => {
      if (context?.previousData && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousData);
        console.error("Mutation failed:", err);
        // Only invalidate on error to get fresh data
        queryClient.invalidateQueries({ queryKey: context.queryKey });
      }
    },
  });
}

export function useMovingCardToColumn() {
  const queryClient = useQueryClient();
  const { boardData } = useBoardContext();

  const boardSlug = boardData?.slug;
  const userId = boardData?.userId;

  return useMutation({
    mutationFn: async ({
      cardId,
      targetListId,
      sourceListId,
    }: {
      cardId: string;
      targetListId: string;
      sourceListId: string;
    }) => {
      if (!sourceListId) return;
      const result = await moveCardToColumn(cardId, targetListId);
      if (!result.success) throw new Error(result.errors?._form?.[0] || "Failed");
      return result;
    },

    onMutate: async ({ cardId, targetListId, sourceListId }) => {
      if (!boardSlug || !userId) return {};
      const queryKey = ["board", boardSlug, userId];

      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<BoardWithData>(queryKey);
      queryClient.setQueryData(queryKey, (oldData: BoardWithData | undefined) => {
        if (!oldData?.lists) return oldData;

        let cardToMove: Card | null = null;

        const updatedLists = oldData.lists.map(list => {
          if (list.id === sourceListId) {
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
          if (list.id === targetListId && cardToMove) {
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
      return { previousData, queryKey };
    },

    onError: (err, variables, context) => {
      if (context?.previousData && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousData);
        console.error("Mutation failed:", err);
        // Only invalidate on error to get fresh data
        queryClient.invalidateQueries({ queryKey: context.queryKey });
      }
    },
  });
}

export function useReorderCardsInList() {
  const queryClient = useQueryClient();
  const { boardData } = useBoardContext();

  const boardSlug = boardData?.slug;
  const userId = boardData?.userId;

  return useMutation({
    mutationFn: async ({ listId, reorderedCards }: { listId: string; reorderedCards: Card[] }) => {
      const result = await reorderCardsInList(listId, reorderedCards);
      if (!result.success) throw new Error(result.errors?._form?.[0] || "Failed");
      return result;
    },
    onMutate: async ({ listId, reorderedCards }) => {
      if (!boardSlug || !userId) return {};
      const queryKey = ["board", boardSlug, userId];
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<BoardWithData>(queryKey);
      queryClient.setQueryData(queryKey, (oldData: BoardWithData) => ({
        ...oldData,
        lists: oldData.lists.map(list =>
          list.id === listId ? { ...list, cards: reorderedCards } : list
        ),
      }));
      return { previousData, queryKey };
    },
    onError: async (err, variables, context) => {
      if (context?.previousData && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousData);
        console.error("Mutation failed:", err);
        // Only invalidate on error to get fresh data
        queryClient.invalidateQueries({ queryKey: context.queryKey });
      }
    },
  });
}
