import type { Card } from "@/types/database";
import CardItem from "@/components/board/card-item";

const ListColumn = ({list}) => {
    return (
        <div className="rounded-xs shadow-sm bg-popover flex flex-col">
            {/* List Header */}
            <div className="p-2 flex items-center justify-between">
                <div className="flex items-center gap-2 justify-center">
                    <div className={`w-2 h-2 rounded-full ${list.color}`}/>
                    <h3 className="text-sm font-medium text-card-foreground">{list.title}</h3>
                    <span className="text-sm text-muted-foreground">{list?.cards?.length || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                    {/* Collapse + Add buttons */}
                </div>
            </div>
            <div className="p-2 space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                {list.cards?.map((card: Card) => (
                    <CardItem key={card.id} card={card} color={list.color}/>
                ))}
            </div>
        </div>
    );
};

export default ListColumn;
