

import { useRef, useState } from "react";

export function useDragSort<T>(
  items: T[],
  onReorder: (reordered: T[]) => void
) {
  const dragIndex = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  function onDragStart(index: number) {
    dragIndex.current = index;
  }

  function onDragEnter(index: number) {
    // Don't re-render if nothing changed
    if (dragOverIndex !== index) setDragOverIndex(index);
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault(); // required to allow drop
  }

  function onDrop() {
    const from = dragIndex.current;
    const to = dragOverIndex;

    if (from === null || to === null || from === to) {
      cleanup();
      return;
    }

    // Splice the dragged item from its old position and insert at new position
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);

    onReorder(next);
    cleanup();
  }

  function onDragEnd() {
    // Fires even if drop target is invalid — always clean up
    cleanup();
  }

  function cleanup() {
    dragIndex.current = null;
    setDragOverIndex(null);
  }

  // Spread these onto each draggable element
  function getDragProps(index: number) {
    return {
      draggable: true as const,
      onDragStart: () => onDragStart(index),
      onDragEnter: () => onDragEnter(index),
      onDragOver,
      onDrop,
      onDragEnd,
    };
  }

  return {
    getDragProps,
    dragOverIndex,
  };
}