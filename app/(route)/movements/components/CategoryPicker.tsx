"use client";

import { useState } from "react";
import { FaSpinner } from "react-icons/fa6";
import { movementCategoryLabels } from "@/constants";
import { CategoryOptions } from "./CategoryOptions";
import { updateMovementCategory } from "@/services/movementServices";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useToast } from "@/context/ToastContext";
import { Movement, MovementCategory } from "@/types";

interface Props {
    movement: Movement;
    onUpdated: (movement: Movement) => void;
}

const chip = "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs";

// Categoría del movimiento. Solo los "Otro" se pueden clasificar a mano: chip → select en el mismo lugar
export const CategoryPicker = ({ movement, onUpdated }: Props) => {

    const axiosAuth = useAxiosAuth();
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const category = movement.atts.category ?? null;
    const editable = movement.atts.transaction_type === 'OTRO';

    if (!editable) {
        return category
            ? <span className={`${chip} bg-surface-sunken text-ink-2`}>{movementCategoryLabels[category]}</span>
            : null;
    }

    const save = async (value: string) => {
        setIsEditing(false);
        const next = (value || null) as MovementCategory | null;
        if (next === category) return;
        setIsSaving(true);
        const { data, error, errors } = await updateMovementCategory(axiosAuth, movement.id, next);
        setIsSaving(false);
        if (data) {
            onUpdated(data);
        } else {
            toast(error ?? Object.values(errors ?? {})[0] ?? 'No se pudo clasificar', 'error');
        }
    };

    if (isSaving) {
        return <span className={`${chip} text-ink-3`}><FaSpinner className="animate-spin" aria-hidden="true" /> Guardando</span>;
    }

    if (isEditing) {
        return (
            <select
                autoFocus
                aria-label="Categoría"
                defaultValue={category ?? ''}
                onChange={(e) => save(e.target.value)}
                onBlur={() => setIsEditing(false)}
                onKeyDown={(e) => e.key === 'Escape' && setIsEditing(false)}
                className="rounded-md border border-primary bg-[var(--background)] px-1.5 py-0.5 text-xs text-ink-1 focus:outline-none"
            >
                <CategoryOptions type={movement.atts.type} />
            </select>
        );
    }

    return category ? (
        <button
            type="button"
            onClick={() => setIsEditing(true)}
            title="Cambiar categoría"
            className={`${chip} bg-surface-sunken text-ink-2 hover:text-ink-1 hover:ring-1 hover:ring-line-strong cursor-pointer`}
        >
            {movementCategoryLabels[category]}
        </button>
    ) : (
        <button
            type="button"
            onClick={() => setIsEditing(true)}
            className={`${chip} border border-dashed border-sri-wait text-sri-wait hover:bg-sri-wait-soft cursor-pointer`}
        >
            Clasificar
        </button>
    );
};
