// hooks/use-cards.ts
import { useBoardContext } from "@/contexts/BoardProvider";
import { BoardWithData, List, Card } from "@/types/database";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createCard } from "@/lib/actions/card-actions";

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
          id: `temp-${Date.now()}`,
          title,
          content,
          listId,
          order: newOrder,
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

      return { previousData, queryKey };
    },

    onError: (err, variables, context) => {
      if (context?.previousData && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
    },

    onSettled: () => {
      if (boardSlug && userId) {
        queryClient.invalidateQueries({ queryKey: ["board", boardSlug, userId] });
      }
    },
  });
}
