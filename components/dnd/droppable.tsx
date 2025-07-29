"use client";

import { useDndContext, useDroppable } from "@dnd-kit/core";

import { cloneElement, ReactElement } from "react";

type DroppableProps = {
  id: string;
  data?: Record<string, unknown>;
  children: ReactElement;
};

export function Droppable(props: DroppableProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: props.id,
    data: props.data,
  });

  const { active } = useDndContext();
  const draggedFromThisList = active?.data?.current?.listId === props.id;
  const shouldShowOverlay = isOver && !draggedFromThisList;

  return (
    <div ref={setNodeRef}>
      {cloneElement(props.children, { isOver: shouldShowOverlay } as { isOver: boolean })}
    </div>
  );
}
