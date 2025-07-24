import type { Card } from "@/types/database";
import DOMPurify from "dompurify";

import React, { memo, useCallback } from "react";

import { PriorityPicker } from "@/components/card/priority-picker";

type CardItemProps = {
  card: Card;
  color: string;
  onPriorityChange?: (cardId: string, priority: Card["priority"]) => void;
};

const CardItem: React.FC<CardItemProps> = memo(({ card, color, onPriorityChange }) => {
  const handlePriorityChange = useCallback(
    (priority: Card["priority"]) => {
      onPriorityChange?.(card.id, priority);
    },
    [card.id, onPriorityChange]
  );

  return (
    <div className="bg-card hover:bg-muted rounded-sm border p-3 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center gap-1">
        <div className={`h-2 w-2 rounded-full ${color}`} />
        <h4 className="text-sm font-medium flex-1">{card.title}</h4>
        <PriorityPicker priority={card.priority} onPriorityChange={handlePriorityChange} />
      </div>
      {card.content && (
        <div
          className="text-muted-foreground text-xs mt-1 line-clamp-2 overflow-hidden"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(card.content) }}
        />
      )}
    </div>
  );
});

CardItem.displayName = "CardItem";

export default CardItem;
