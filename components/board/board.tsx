"use client";

import { useBoardContext } from "@/contexts/BoardProvider";
import { List } from "@/types/database";

import { WORKSPACE_LISTS } from "@/lib/constants/config";

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

  return (
    <div className="flex h-screen flex-col">
      <div className="bg-background flex-1 items-center justify-between overflow-x-auto">
        <div className="grid h-full grid-cols-1 gap-2 px-2 py-1 lg:grid-cols-5">
          {WORKSPACE_LISTS.map(configList => {
            const dbList = boardData.lists.find(list => list.type === configList.id);

            if (!dbList) return null;

            const enrichedList: EnrichedList = {
              ...dbList,
              icon: configList.icon,
              color: configList.color,
            };

            return <ListColumn key={dbList.id} list={enrichedList as EnrichedList} />;
          })}
        </div>
      </div>
    </div>
  );
};

export default Board;
