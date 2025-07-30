"use client";

import { useBoardContext } from "@/contexts/BoardProvider";
import { BoardWithData, List } from "@/types/database";

import { useMemo, useState, useEffect } from "react";

import { WORKSPACE_LISTS } from "@/lib/constants/config";

import DndBoardProvider from "@/components/board/dnd-board-provider";
import HiddenColumnsArea from "@/components/board/hidden-columns-area";
import ListColumn from "@/components/board/list-column";
import { Droppable } from "@/components/dnd/droppable";

type EnrichedList = List & {
  icon: string;
  color: string;
};

const Board = () => {
  const { boardData, isLoading } = useBoardContext();
  const [localBoardData, setLocalBoardData] = useState<BoardWithData>(boardData!);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  // need context change for initial load + regular updates
  useEffect(() => {
    if (boardData && !hasPendingChanges) {
      setLocalBoardData(boardData);
    }
  }, [boardData, hasPendingChanges]);

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

  const { visibleLists, hiddenLists } = useMemo(() => {
    const visible = enrichedLists.filter(list => !list.collapsed);
    const hidden = enrichedLists.filter(list => list.collapsed);
    return {
      visibleLists: visible,
      hiddenLists: hidden,
    };
  }, [enrichedLists]);

  if (isLoading || !localBoardData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="bg-background flex-1 overflow-hidden">
        <div className="flex h-full">
          {/* Visible columns area */}
          <div className="flex gap-2 px-2 py-1 overflow-x-auto overflow-y-hidden flex-1">
            <DndBoardProvider
              localBoardData={localBoardData}
              setLocalBoardData={setLocalBoardData}
              onPendingChanges={() => setHasPendingChanges(true)}
              onChangesComplete={() => setHasPendingChanges(false)}
            >
              <>
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
                        hiddenLists.length > 0 ? "w-96 flex-shrink-0 h-full" : "flex-1 h-full"
                      }
                    >
                      <Droppable key={list.id} id={list.id}>
                        <ListColumn list={list} key={list.id} />
                      </Droppable>
                    </div>
                  ))
                )}
              </>
            </DndBoardProvider>
          </div>

          {/* Hidden columns area */}
          <HiddenColumnsArea hiddenLists={hiddenLists} />
        </div>
      </div>
    </div>
  );
};

export default Board;
