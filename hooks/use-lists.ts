import { useBoardContext } from "@/contexts/BoardProvider";
import { BoardWithData, List } from "@/types/database";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toggleListCollapsed } from "@/lib/actions/list-actions";

export function useToggleListCollapsed() {
  const queryClient = useQueryClient();
  const { boardData } = useBoardContext();

  const boardSlug = boardData?.slug;
  const userId = boardData?.userId;

  return useMutation({
    mutationFn: async ({ listId, collapsed }: { listId: string; collapsed: boolean }) => {
      const result = await toggleListCollapsed(listId, collapsed);
      if (!result.success) throw new Error(result.errors?._form?.[0] || "Failed");
      return result;
    },

    onMutate: async ({ listId, collapsed }) => {
      if (!boardSlug || !userId) return {};

      const queryKey = ["board", boardSlug, userId];

      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<BoardWithData>(queryKey);

      // Optimistic update
      queryClient.setQueryData<BoardWithData>(queryKey, old => {
        if (!old) return old;

        return {
          ...old,
          lists: old.lists.map((list: List) =>
            list.id === listId ? { ...list, collapsed } : list
          ),
        };
      });

      return { previousData, queryKey };
    },

    onError: (err, variables, context) => {
      if (context?.previousData && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousData);
        // Only invalidate on error to get fresh data
        queryClient.invalidateQueries({ queryKey: context.queryKey });
      }
    },
  });
}
