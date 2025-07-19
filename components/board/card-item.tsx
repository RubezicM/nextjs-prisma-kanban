import type { Card } from "@/types/database";

type CardItemProps = {
  card: Card;
  color: string;
};

const CardItem = ({ card, color }: CardItemProps) => {
  return (
    <div className="bg-card hover:bg-muted rounded-sm border p-3 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center gap-1">
        <div className={`h-2 w-2 rounded-full ${color}`} />
        <h4 className="text-sm font-medium">{card.title}</h4>
      </div>
      {card.content && <p className="mt-1 line-clamp-2 text-xs text-gray-400">{card.content}</p>}
    </div>
  );
};

export default CardItem;
