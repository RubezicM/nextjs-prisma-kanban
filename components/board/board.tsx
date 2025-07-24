"use client";

import { useBoardContext } from "@/contexts/BoardProvider";
import { List } from "@/types/database";

import { useMemo } from "react";

import { WORKSPACE_LISTS } from "@/lib/constants/config";

import HiddenColumnsArea from "@/components/board/hidden-columns-area";
import ListColumn from "@/components/board/list-column";

type EnrichedList = List & {
  icon: string;
  color: string;
};

const Board = () => {
  const { boardData, isLoading } = useBoardContext();

  const enrichedLists: EnrichedList[] = useMemo(() => {
    if (isLoading || !boardData?.lists) return [];

    return WORKSPACE_LISTS.map(configList => {
      const dbList = boardData.lists.find(list => list.type === configList.id);
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
    }).filter(Boolean) as EnrichedList[];
  }, [isLoading, boardData?.lists]);

  const { visibleLists, hiddenLists } = useMemo(
    () => ({
      visibleLists: enrichedLists.filter(list => !list.collapsed),
      hiddenLists: enrichedLists.filter(list => list.collapsed),
    }),
    [enrichedLists]
  );

  if (isLoading || !boardData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="bg-background flex-1 overflow-hidden">
        <div className="flex h-full">
          {/* Visible columns area */}
          <div className="flex gap-2 px-2 py-1 overflow-x-auto flex-1">
            {visibleLists.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-muted-foreground text-lg font-medium">All columns are hidden</p>
              </div>
            ) : (
              visibleLists.map(list => (
                <div
                  key={list.id}
                  className={
                    hiddenLists.length > 0
                      ? "w-96 flex-shrink-0"
                      : "flex-1 min-w-[280px] max-w-[400px]"
                  }
                >
                  <ListColumn list={list} />
                </div>
              ))
            )}
          </div>

          {/* Hidden columns area */}
          <HiddenColumnsArea hiddenLists={hiddenLists} />
        </div>
      </div>
    </div>
  );
};

export default Board;
