import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableCardItemProps {
  id: string;
  listId: string;
  children: React.ReactNode;
}

export function SortableCardItem({ id, listId, children }: SortableCardItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: id,
    data: {
      listId: listId,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    transformOrigin: "0 0",
    touchAction: "manipulation",
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="transition-transform duration-200 ease-in-out"
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}
