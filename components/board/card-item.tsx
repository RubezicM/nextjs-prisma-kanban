import type { Card } from "@/types/database";

type CardItemProps = {
    card: Card;
    color: string;
}

const CardItem = ({card, color}: CardItemProps) => {
    return (
        <div className="border rounded-sm p-3 shadow-sm hover:shadow-md transition-shadow bg-card hover:bg-muted">
            <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${color}`}/>
                <h4 className="font-medium text-sm">{card.title}</h4>
            </div>
            {card.content && (
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{card.content}</p>
            )}
        </div>
    );
};

export default CardItem;
