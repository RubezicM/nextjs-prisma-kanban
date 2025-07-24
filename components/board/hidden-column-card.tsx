import { useToggleListCollapsed } from "@/hooks/use-lists";
import type { Card, List } from "@/types/database";
import { Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type HiddenColumnCardProps = {
  list: List & {
    icon: string;
    color: string;
    cards: Card[];
  };
};

const HiddenColumnCard = ({ list }: HiddenColumnCardProps) => {
  const toggleListCollapsedMutation = useToggleListCollapsed();

  const handleRestoreList = () => {
    toggleListCollapsedMutation.mutate({ listId: list.id, collapsed: false });
  };

  return (
    <div className="bg-card hover:bg-muted/50 border rounded-sm p-3 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className={`h-2 w-2 rounded-full flex-shrink-0 ${list.color}`} />
          <div className="flex flex-col min-w-0">
            <h4 className="text-sm font-medium truncate">{list.title}</h4>
            <span className="text-xs text-muted-foreground">{list.cards?.length || 0} cards</span>
          </div>
        </div>
        <Tooltip delayDuration={800}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 flex-shrink-0"
              onClick={handleRestoreList}
              disabled={toggleListCollapsedMutation.isPending}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="border rounded-sm">
            Show column
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export default HiddenColumnCard;
