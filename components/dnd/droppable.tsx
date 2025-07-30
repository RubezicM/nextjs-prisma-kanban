"use client";

import { useDroppable } from "@dnd-kit/core";

import { cloneElement, ReactElement } from "react";

type DroppableProps = {
  id: string;
  data?: Record<string, unknown>;
  children: ReactElement;
};

export function Droppable(props: DroppableProps) {
  const { setNodeRef, over, active } = useDroppable({
    id: props.id,
    data: props.data,
  });

  const draggedFromThisList = active?.data?.current?.listId === props.id;
  const draggingToThisList = over?.data?.current?.listId === props.id || over?.id === props.id;

  const shouldShowOverlay = !draggedFromThisList && draggingToThisList;
  return (
    <div ref={setNodeRef}>
      {cloneElement(props.children, { isOver: shouldShowOverlay } as { isOver: boolean })}
    </div>
  );
}
