import { useBoardContext } from "@/contexts/BoardProvider";
import type { Card } from "@/types/database";

import React, { memo, useCallback } from "react";

import Link from "next/link";

import { PriorityPicker } from "@/components/card/priority-picker";

type CardItemProps = {
  card: Card;
  color: string;
  onPriorityChange?: (cardId: string, priority: Card["priority"]) => void;
};

const CardItem: React.FC<CardItemProps> = memo(
  ({ card, color, onPriorityChange }) => {
    const handlePriorityChange = useCallback(
      (priority: Card["priority"]) => {
        onPriorityChange?.(card.id, priority);
      },
      [card.id, onPriorityChange]
    );

    const { boardData } = useBoardContext();

    return (
      <Link href={`/board/${boardData?.slug}/${card.id}`} className="no-underline">
        <div className="bg-card hover:bg-muted rounded-sm border p-3 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center gap-1 select-none">
            <div className={`h-2 w-2 rounded-full ${color}`} />
            <h4 className="text-sm font-medium flex-1">{card.title}</h4>
            <div className="select-auto" data-no-drag={true} onClick={e => e.stopPropagation()}>
              <PriorityPicker priority={card.priority} onPriorityChange={handlePriorityChange} />
            </div>
          </div>
        </div>
      </Link>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.card.id === nextProps.card.id &&
      prevProps.card.title === nextProps.card.title &&
      prevProps.card.order === nextProps.card.order &&
      prevProps.card.content === nextProps.card.content &&
      prevProps.card.priority === nextProps.card.priority
    );
  }
);

CardItem.displayName = "CardItem";

export default CardItem;
