import { useUpdateCardPriority } from "@/hooks/use-cards";
import { useToggleListCollapsed } from "@/hooks/use-lists";
import type { Card } from "@/types/database";
import { List } from "@/types/database";
import { Ellipsis, Plus } from "lucide-react";

import { useState, memo, useCallback, JSX } from "react";

import AddCardTrigger from "@/components/board/add-card-trigger";
import CardItem from "@/components/board/card-item";
import { Draggable } from "@/components/dnd/draggable";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type ListColumnProps = {
  list: List & {
    icon: string;
    color: string;
    cards: Card[];
  };
  isOver?: boolean;
};

const ListColumnComponent: ({ list, isOver }: ListColumnProps) => JSX.Element = ({
  list,
  isOver,
}) => {
  const [listHovered, setListHovered] = useState(false);
  const updateCardPriorityMutation = useUpdateCardPriority();
  const toggleListCollapsedMutation = useToggleListCollapsed();

  const handlePriorityChange = useCallback(
    (cardId: string, priority: Card["priority"]) => {
      updateCardPriorityMutation.mutate({ cardId, priority });
    },
    [updateCardPriorityMutation]
  );

  const handleHideList = useCallback(() => {
    toggleListCollapsedMutation.mutate({ listId: list.id, collapsed: true });
  }, [toggleListCollapsedMutation, list.id]);

  const handleMouseEnter = useCallback(() => {
    setListHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setListHovered(false);
  }, []);

  const handleAddCardClick = useCallback(() => {
    setListHovered(false);
  }, []);
  return (
    <div
      className="bg-popover flex flex-col rounded-xs shadow-sm h-[90vh] relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
              <button onClick={handleHideList}>
                <Ellipsis
                  className="hover:bg-muted w-6 h-6 p-1 rounded-sm transition-all duration-200"
                  strokeWidth={2}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="border rounded-sm">
              <p className="text-foreground">Hide column</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip delayDuration={800}>
            <TooltipTrigger asChild>
              <AddCardTrigger listId={list.id} onClick={handleAddCardClick}>
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
      {isOver && (
        <div className="absolute top-10 left-0 right-0 bottom-0 bg-black/70 rounded-sm border pointer-events-none z-9"></div>
      )}

      {/* List Content */}
      <div className="flex-1 space-y-2 p-2 min-h-0 relative isolation-isolate overflow-y-auto overflow-x-hidden">
        {list.cards?.map((card: Card) => (
          <Draggable key={card.id} id={card.id} data={{ listId: list.id }}>
            <CardItem card={card} color={list.color} onPriorityChange={handlePriorityChange} />
          </Draggable>
        ))}
        <AddCardTrigger listId={list.id}>
          <div
            className={`w-full border p-1 flex items-center justify-center rounded-sm transition-all duration-200 bg-muted/20 hover:bg-muted ${listHovered && !isOver ? "opacity-100" : "opacity-0"}`}
          >
            +
          </div>
        </AddCardTrigger>
      </div>
    </div>
  );
};

const ListColumn = memo(ListColumnComponent);
ListColumn.displayName = "ListColumn";

export default ListColumn;
