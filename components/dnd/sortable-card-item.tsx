import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { useCallback } from "react";

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

  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      // target or its parents have data-no-drag
      const target = (event.target as Element).closest("[data-no-drag]");
      if (target) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      // if we're clicking on any shadcn dropdown content, prevent the drag
      const shadcnContent = (event.target as Element).closest(
        '[role="menu"], [data-radix-dropdown-content]'
      );
      if (shadcnContent) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      // call the original drag listeners
      listeners?.onPointerDown?.(event);
    },
    [listeners]
  );

  const customListeners = {
    ...listeners,
    onPointerDown: handlePointerDown,
  };

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
      {...customListeners}
    >
      {children}
    </div>
  );
}
