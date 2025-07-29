"use client";

import { useDraggable } from "@dnd-kit/core";

import React, { ReactNode } from "react";

type DraggableProps = {
  id: string;
  data?: Record<string, unknown>;
  children: ReactNode;
};

export function Draggable(props: DraggableProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: props.id,
    data: props.data,
  });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={isDragging ? "opacity-0 cursor-grabbing" : "cursor-grab"} // Hide original when dragging
    >
      {props.children}
    </div>
  );
}
