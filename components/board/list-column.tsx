import { useUpdateCardPriority } from "@/hooks/use-cards";
import type { Card } from "@/types/database";
import { List } from "@/types/database";
import { Ellipsis, Plus } from "lucide-react";

import { useState } from "react";

import AddCardTrigger from "@/components/board/add-card-trigger";
import CardItem from "@/components/board/card-item";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type ListColumnProps = {
  list: List & {
    icon: string;
    color: string;
    cards: Card[];
  };
};

const ListColumn = ({ list }: ListColumnProps) => {
  const [listHovered, setListHovered] = useState(false);
  const updateCardPriorityMutation = useUpdateCardPriority();

  const handlePriorityChange = (cardId: string, priority: Card["priority"]) => {
    updateCardPriorityMutation.mutate({ cardId, priority });
  };
  return (
    <div
      className="bg-popover flex flex-col rounded-xs shadow-sm"
      onMouseEnter={() => {
        setListHovered(true);
      }}
      onMouseLeave={() => {
        setListHovered(false);
      }}
    >
      {/* List Header */}
      <div className="flex items-center justify-between p-2">
        <div className="flex items-center justify-center gap-2">
          <div className={`h-2 w-2 rounded-full ${list.color}`} />
          <h3 className="text-card-foreground text-sm font-medium">{list.title}</h3>
          <span className="text-muted-foreground text-sm">{list?.cards?.length || 0}</span>
        </div>
        <div className="flex items-center gap-1">
          <Tooltip delayDuration={800}>
            <TooltipTrigger asChild>
              <Ellipsis
                className="hover:bg-muted w-6 h-6 p-1 rounded-sm transition-all duration-200"
                strokeWidth={2}
              />
            </TooltipTrigger>
            <TooltipContent side="bottom" className="border rounded-sm">
              <p className="text-foreground">Minimize</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip delayDuration={800}>
            <TooltipTrigger asChild>
              <AddCardTrigger listId={list.id} onClick={() => setListHovered(false)}>
                <Plus
                  className="hover:bg-muted w-6 h-6 p-1 rounded-sm transition-all duration-200"
                  strokeWidth={2}
                />
              </AddCardTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="border rounded-sm">
              Add a new card
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      <div className="max-h-[calc(100vh-300px)] space-y-2 overflow-y-auto p-2">
        {list.cards?.map((card: Card) => (
          <CardItem
            key={card.id}
            card={card}
            color={list.color}
            onPriorityChange={handlePriorityChange}
          />
        ))}
        <AddCardTrigger listId={list.id}>
          <div
            className={`w-full border p-1 flex items-center justify-center rounded-sm transition-all duration-200 bg-muted/20 hover:bg-muted ${listHovered ? "opacity-100" : "opacity-0"}`}
          >
            +
          </div>
        </AddCardTrigger>
      </div>
    </div>
  );
};

export default ListColumn;
