"use client";

import { useMovingCardToColumn, useReorderCardsInList } from "@/hooks/use-cards";
import { Card, BoardWithData, List } from "@/types/database";
import {
  DndContext,
  DragOverlay,
  useSensors,
  useSensor,
  PointerSensor,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

import { useCallback, useState, useMemo } from "react";

import CardItem from "@/components/board/card-item";

interface DndBoardProviderProps {
  children: React.ReactNode;
  localBoardData: BoardWithData;
  setLocalBoardData: React.Dispatch<React.SetStateAction<BoardWithData>>;
  onPendingChanges: () => void;
  onChangesComplete: () => void;
}

const DndBoardProvider = ({
  children,
  localBoardData,
  setLocalBoardData,
  onPendingChanges,
  onChangesComplete,
}: DndBoardProviderProps) => {
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const moveCardMutation = useMovingCardToColumn();
  const sortCardMutation = useReorderCardsInList();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 0,
        delay: 100,
        tolerance: 5,
      },
    })
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const draggedCardId = String(event.active.id);
      const sourceListId = event.active.data?.current?.listId;

      let card: Card | null = null;

      // get the card to show on drag overlay
      if (localBoardData?.lists) {
        for (const list of localBoardData.lists) {
          if (list.id === sourceListId) {
            const foundCard = list.cards.find((c: Card) => c.id === draggedCardId);
            if (foundCard) {
              card = foundCard;
              break;
            }
          }
        }
      }

      setActiveCard(card);
    },
    [localBoardData?.lists]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { over, active } = event;
      if (!over) return;

      const targetListId = over.data.current?.listId ?? String(over.id);
      const cardId = String(active.id);
      const sourceListId = active.data?.current?.listId;

      if (!sourceListId) {
        return;
      }
      if (sourceListId === targetListId) {
        onPendingChanges();
        const sourceListIndex = localBoardData.lists.findIndex((l: List) => l.id === sourceListId);
        if (sourceListIndex === -1) return;
        const currentList = localBoardData.lists[sourceListIndex];
        const oldCardIndex = currentList.cards.findIndex((c: Card) => c.id === cardId);
        const newCardIndex = currentList.cards.findIndex((c: Card) => c.id === String(over.id));
        const reorderedCards = arrayMove(currentList.cards, oldCardIndex, newCardIndex);

        setLocalBoardData(prevData => {
          if (!prevData.lists) return prevData;
          if (oldCardIndex === -1 || newCardIndex === -1 || oldCardIndex === newCardIndex)
            return prevData;

          const newLists = [...prevData.lists];
          newLists[sourceListIndex] = {
            ...currentList,
            cards: reorderedCards,
          };

          return {
            ...prevData,
            lists: newLists,
          };
        });

        setActiveCard(null);
        sortCardMutation.mutate(
          { listId: sourceListId, reorderedCards: reorderedCards },
          {
            onSuccess: () => {
              onChangesComplete();
            },
            onError: (err, variables, context) => {
              console.error("[DndProvider] Reordering cards failed:", err);
              // Rollback optimistic update if needed
              setLocalBoardData(prevData => {
                if (!context?.previousData) return prevData;
                return context.previousData;
              });
              onChangesComplete();
            },
          }
        );
        return;
      } else {
        onPendingChanges();

        // We need this to prevent flicker animation :/
        setLocalBoardData(prevData => {
          if (!prevData?.lists) return prevData;

          const sourceListIndex = prevData.lists.findIndex((l: List) => l.id === sourceListId);
          const targetListIndex = prevData.lists.findIndex((l: List) => l.id === targetListId);

          if (sourceListIndex === -1 || targetListIndex === -1) return prevData;

          // only clone the lists array to avoid mutating state directly
          const newLists = [...prevData.lists];

          const sourceList = newLists[sourceListIndex];
          const cardIndex = sourceList.cards.findIndex((c: Card) => c.id === cardId);
          const cardToMove = sourceList.cards[cardIndex];

          newLists[sourceListIndex] = {
            ...sourceList,
            cards: sourceList.cards.filter((c: Card) => c.id !== cardId),
          };

          const targetList = newLists[targetListIndex];
          newLists[targetListIndex] = {
            ...targetList,
            cards: [...targetList.cards, cardToMove],
          };

          return {
            ...prevData,
            lists: newLists,
          };
        });

        setActiveCard(null);

        moveCardMutation.mutate(
          { cardId, targetListId, sourceListId },
          {
            onSuccess: () => {
              onChangesComplete();
            },
            onError: (err, variables, context) => {
              console.error("[DndProvider] Moving card failed:", err);
              // Rollback optimistic update if needed
              setLocalBoardData(prevData => {
                if (!context?.previousData) return prevData;
                return context.previousData;
              });
              onChangesComplete();
            },
          }
        );
      }
    },
    [
      setLocalBoardData,
      moveCardMutation,
      onChangesComplete,
      onPendingChanges,
      sortCardMutation,
      localBoardData.lists,
    ]
  );

  // card-to-color mapping for DragOverlay
  const cardColorMap = useMemo(() => {
    const colorMap = new Map<string, string>();
    if (localBoardData?.lists) {
      localBoardData.lists.forEach((list: List) => {
        list.cards.forEach((card: Card) => {
          colorMap.set(card.id, list.color ?? "bg-gray-500");
        });
      });
    }
    return colorMap;
  }, [localBoardData?.lists]);

  return (
    <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart} sensors={sensors}>
      <>
        <DragOverlay>
          {activeCard ? (
            <div className="opacity-95 cursor-grabbing">
              <CardItem
                card={activeCard}
                color={cardColorMap.get(activeCard.id) || "bg-gray-500"}
              />
            </div>
          ) : null}
        </DragOverlay>
        {children}
      </>
    </DndContext>
  );
};

export default DndBoardProvider;
