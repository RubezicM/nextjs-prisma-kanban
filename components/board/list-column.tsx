import type { Card } from "@/types/database";
import { List } from "@/types/database";

import CardItem from "@/components/board/card-item";

type ListColumnProps = {
  list: List & {
    icon: string;
    color: string;
    cards: Card[]; // Explicit cards array
  };
};

const ListColumn = ({ list }: ListColumnProps) => {
  return (
    <div className="bg-popover flex flex-col rounded-xs shadow-sm">
      {/* List Header */}
      <div className="flex items-center justify-between p-2">
        <div className="flex items-center justify-center gap-2">
          <div className={`h-2 w-2 rounded-full ${list.color}`} />
          <h3 className="text-card-foreground text-sm font-medium">{list.title}</h3>
          <span className="text-muted-foreground text-sm">{list?.cards?.length || 0}</span>
        </div>
        <div className="flex items-center gap-2">{/* Collapse + Add buttons */}</div>
      </div>
      <div className="max-h-[calc(100vh-300px)] space-y-2 overflow-y-auto p-2">
        {list.cards?.map((card: Card) => (
          <CardItem key={card.id} card={card} color={list.color} />
        ))}
      </div>
    </div>
  );
};

export default ListColumn;
