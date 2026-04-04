import React, { useCallback } from 'react';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { MediaItem } from '../types/midiaTypes';
import { useMediaDragSensors } from '../hooks/useMediaDragDrop';
import { MediaCard } from './MediaCard';

function SortableMediaTile({
  item,
  disabled,
  onRemover,
  onDefinirPrincipal,
}: {
  item: MediaItem;
  disabled?: boolean;
  onRemover: () => void;
  onDefinirPrincipal: () => void;
}): React.ReactElement {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <MediaCard
        item={item}
        disabled={disabled}
        onRemover={onRemover}
        onDefinirPrincipal={onDefinirPrincipal}
        dragHandleProps={{
          ref: setActivatorNodeRef,
          ...listeners,
          ...attributes,
        }}
      />
    </div>
  );
}

export type MediaGridProps = {
  itens: MediaItem[];
  disabled?: boolean;
  onReordenar: (itens: MediaItem[]) => void;
  onRemover: (id: string) => void;
  onDefinirPrincipal: (id: string) => void;
};

export function MediaGrid({
  itens,
  disabled,
  onReordenar,
  onRemover,
  onDefinirPrincipal,
}: MediaGridProps): React.ReactElement {
  const sensors = useMediaDragSensors();

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = itens.findIndex((i) => i.id === active.id);
      const newIndex = itens.findIndex((i) => i.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return;
      onReordenar(arrayMove(itens, oldIndex, newIndex));
    },
    [itens, onReordenar]
  );

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={itens.map((i) => i.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {itens.map((item) => (
            <SortableMediaTile
              key={item.id}
              item={item}
              disabled={disabled}
              onRemover={() => onRemover(item.id)}
              onDefinirPrincipal={() => onDefinirPrincipal(item.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
