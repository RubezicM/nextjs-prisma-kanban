'use client';

import { useBoardContext } from "@/contexts/BoardProvider";
import ListColumn from "@/components/board/list-column";
import { WORKSPACE_LISTS } from "@/lib/constants/config";
import { List } from "@/types/database";


type EnrichedList = List & {
    icon: string;
    color:string
}

const Board = () => {
    const { boardData, isLoading } = useBoardContext();

    if (isLoading || !boardData) {
        return <div>Loading...</div>
    }


  return (
      <div className="flex flex-col h-screen">
        <div className="flex-1 overflow-x-auto items-center justify-between bg-background">
         <div className="grid grid-cols-1 lg:grid-cols-5 gap-2 h-full px-2 py-1">
             {WORKSPACE_LISTS.map(configList => {
                 const dbList = boardData.lists.find(list => list.type === configList.id)

                 if (!dbList) return null

                 const enrichedList: EnrichedList = {
                     ...dbList,
                     icon: configList.icon,
                     color: configList.color
                 }

                 return (
                     <ListColumn
                         key={dbList.id}
                         list={enrichedList as EnrichedList}
                     />
                 )
             })}
         </div>
        </div>
      </div>
  );
};

export default Board;
