"use client";

import { ReactNode } from "react";
import {
    DndContext, DragEndEvent, KeyboardSensor, PointerSensor, TouchSensor, closestCenter, useSensor, useSensors,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { MdDragIndicator } from "react-icons/md";

interface ListProps {
    ids: string[];
    onMove: (activeId: string, overId: string) => void;
    children: ReactNode;
}

// Contexto de arrastre vertical para las líneas de la venta (tabla y tarjetas)
export const SortableItems = ({ ids, onMove, children }: ListProps) => {

    const sensors = useSensors(
        // Distancia mínima para no confundir un clic con un arrastre
        useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
        // En táctil se mantiene presionado para no pelear con el scroll
        useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const handleDragEnd = ({ active, over }: DragEndEvent) => {
        if (over && active.id !== over.id) onMove(String(active.id), String(over.id));
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            onDragEnd={handleDragEnd}
            accessibility={{
                screenReaderInstructions: { draggable: 'Para mover la línea presiona espacio, usa las flechas y vuelve a presionar espacio para soltar.' },
            }}
        >
            <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                {children}
            </SortableContext>
        </DndContext>
    );
};

// Estado de arrastre de una línea: estilos para el contenedor y props para el asa
export const useSortableItem = (id: string) => {
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id });

    return {
        setNodeRef,
        isDragging,
        style: {
            // Translate (sin escala) para que las filas de tabla no se deformen
            transform: CSS.Translate.toString(transform),
            transition,
            position: 'relative' as const,
            zIndex: isDragging ? 10 : undefined,
        },
        handleProps: { ref: setActivatorNodeRef, ...attributes, ...listeners },
    };
};

type HandleProps = ReturnType<typeof useSortableItem>['handleProps'] & { label?: string };

export const DragHandle = ({ label = 'Mover línea', ...props }: HandleProps) => (
    <button
        type="button"
        aria-label={label}
        title="Arrastra para reordenar"
        className="grid size-8 shrink-0 place-items-center rounded-md text-ink-4 hover:text-ink-2 hover:bg-surface-sunken cursor-grab active:cursor-grabbing touch-none focus-visible:outline-2 focus-visible:outline-primary"
        {...props}
    >
        <MdDragIndicator className="text-lg" aria-hidden="true" />
    </button>
);
