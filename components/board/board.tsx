"use client";

import { useBoardContext } from "@/contexts/BoardProvider";
import { List } from "@/types/database";

import { WORKSPACE_LISTS } from "@/lib/constants/config";

import HiddenColumnsArea from "@/components/board/hidden-columns-area";
import ListColumn from "@/components/board/list-column";

type EnrichedList = List & {
  icon: string;
  color: string;
};

const Board = () => {
  const { boardData, isLoading } = useBoardContext();

  if (isLoading || !boardData) {
    return <div>Loading...</div>;
  }

  // Enrich all lists with config data
  const enrichedLists: EnrichedList[] = WORKSPACE_LISTS.map(configList => {
    const dbList = boardData.lists.find(list => list.type === configList.id);
    if (!dbList) return null;

    return {
      ...dbList,
      icon: configList.icon,
      color: configList.color,
    };
  }).filter(Boolean) as EnrichedList[];

  // Separate visible and hidden lists
  const visibleLists = enrichedLists.filter(list => !list.collapsed);
  const hiddenLists = enrichedLists.filter(list => list.collapsed);

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
