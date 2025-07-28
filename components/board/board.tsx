"use client";

import { useBoardContext } from "@/contexts/BoardProvider";
import { List, Card } from "@/types/database";
import {
  DndContext,
  DragOverlay,
  useSensors,
  useSensor,
  PointerSensor,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";

import { useEffect, useCallback } from "react";
import { useMemo, useState } from "react";

import { WORKSPACE_LISTS } from "@/lib/constants/config";

import CardItem from "@/components/board/card-item";
import HiddenColumnsArea from "@/components/board/hidden-columns-area";
import ListColumn from "@/components/board/list-column";
import { Droppable } from "@/components/dnd/droppable";

type EnrichedList = List & {
  icon: string;
  color: string;
};

const Board = () => {
  const { boardData, isLoading, updateCardPositionOptimistic } = useBoardContext();
  const [localBoardData, setLocalBoardData] = useState(boardData);
  const [activeCard, setActiveCard] = useState<Card | null>(null);

  useEffect(() => {
    if (boardData) {
      setLocalBoardData(boardData);
    }
  }, [boardData]);

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
            const foundCard = list.cards.find(c => c.id === draggedCardId);
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

      const cardIdMoved = String(active.id);
      const targetListId = String(over.id);
      const sourceListId = active.data?.current?.listId;

      if (!sourceListId || sourceListId === targetListId) {
        console.log("Dropped on same list or invalid drop, ignoring");
        return;
      }

      // We need this to prevent flicker animation :/
      setLocalBoardData(prevData => {
        if (!prevData?.lists) return prevData;

        let cardToMove: Card | null = null;

        const updatedLists = prevData.lists.map(list => {
          if (list.id === sourceListId) {
            const cardIndex = list.cards.findIndex(card => card.id === cardIdMoved);
            if (cardIndex !== -1) {
              cardToMove = list.cards[cardIndex];
              return {
                ...list,
                cards: list.cards.filter(card => card.id !== cardIdMoved),
              };
            }
          }
          return list;
        });

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
          ...prevData,
          lists: finalLists,
        };
      });

      // reset the dragged card
      setActiveCard(null);

      // and update context #todo brainstorm if we need optimistic update since we already did that
      updateCardPositionOptimistic(cardIdMoved, sourceListId, targetListId);
    },
    [updateCardPositionOptimistic]
  );

  const enrichedLists: EnrichedList[] = useMemo(() => {
    if (isLoading || !localBoardData?.lists) return [];

    return WORKSPACE_LISTS.map(configList => {
      const dbList = localBoardData.lists.find(list => list.type === configList.id);
      if (!dbList) return null;

      return {
        id: dbList.id,
        title: dbList.title,
        type: dbList.type,
        collapsed: dbList.collapsed,
        cards: dbList.cards || [],
        icon: configList.icon,
        color: configList.color,
      };
    }) as EnrichedList[];
  }, [isLoading, localBoardData?.lists]);

  const { visibleLists, hiddenLists, cardColorMap } = useMemo(() => {
    const visible = enrichedLists.filter(list => !list.collapsed);
    const hidden = enrichedLists.filter(list => list.collapsed);

    // card-to-color mapping for DragOverlay
    const colorMap = new Map<string, string>();
    enrichedLists.forEach(list => {
      list.cards.forEach(card => {
        colorMap.set(card.id, list.color);
      });
    });

    return {
      visibleLists: visible,
      hiddenLists: hidden,
      cardColorMap: colorMap,
    };
  }, [enrichedLists]);

  if (isLoading || !localBoardData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="bg-background flex-1 overflow-hidden">
        <div className="flex h-full">
          {/* Visible columns area */}
          <div className="flex gap-2 px-2 py-1 overflow-x-auto flex-1">
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
                {visibleLists.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-muted-foreground text-lg font-medium">
                      All columns are hidden
                    </p>
                  </div>
                ) : (
                  visibleLists.map(list => (
                    <div
                      key={list.id}
                      className={
                        hiddenLists.length > 0
                          ? "w-96 flex-shrink-0 h-full"
                          : "flex-1 min-w-[280px] max-w-[400px] h-full"
                      }
                    >
                      <Droppable key={list.id} id={list.id}>
                        <ListColumn list={list} />
                      </Droppable>
                    </div>
                  ))
                )}
              </>
            </DndContext>
          </div>

          {/* Hidden columns area */}
          <HiddenColumnsArea hiddenLists={hiddenLists} />
        </div>
      </div>
    </div>
  );
};

export default Board;
