// hooks/use-card-auto-save.ts
import { useBoardContext } from "@/contexts/BoardProvider";
import { BoardWithData } from "@/types/database";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDebouncedCallback } from "use-debounce";

import { updateCardContent } from "@/lib/actions/card-actions";

export function useCardAutoSave(cardId: string) {
  const queryClient = useQueryClient();
  const { boardData } = useBoardContext();

  const boardSlug = boardData?.slug;
  const userId = boardData?.userId;

  const mutation = useMutation({
    mutationFn: async (updates: { title?: string; content?: string }) => {
      const result = await updateCardContent(cardId, updates);
      if (!result.success) {
        console.error("Auto-save failed:", result.errors);
        return result;
      }
      return result;
    },

    onMutate: async (updates: { title?: string; content?: string }) => {
      if (!boardSlug || !userId) return {};

      const queryKey = ["board", boardSlug, userId];

      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<BoardWithData>(queryKey);

      queryClient.setQueryData<BoardWithData>(queryKey, old => {
        if (!old) return old;

        return {
          ...old,
          lists: old.lists.map(list => ({
            ...list,
            cards: list.cards.map(card =>
              card.id === cardId ? { ...card, ...updates, updatedAt: new Date() } : card
            ),
          })),
        };
      });

      return { previousData, queryKey };
    },

    onError: (err, variables, context) => {
      if (context?.previousData && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousData);
        console.error("Auto-save mutation failed:", err);
      }
    },

    onSuccess: (data, variables, context) => {
      if (!data.success && context?.previousData && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
      //  optimistic update is already applied, no need to do anything
    },
  });

  const debouncedSaveTitle = useDebouncedCallback((title: string) => {
    if (title.trim()) {
      mutation.mutate({ title: title.trim() });
    }
  }, 300);

  const debouncedSaveContent = useDebouncedCallback((content: string) => {
    mutation.mutate({ content });
  }, 500);

  return {
    saveTitle: debouncedSaveTitle,
    saveContent: debouncedSaveContent,
    isSaving: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    lastVariables: mutation.variables,
  };
}
