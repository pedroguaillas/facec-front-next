"use client";

import { formatFactor } from "@/helpers/presentationHelper";
import { useProductPresentations } from "@/lib/hooks/useProductPresentations";
import { ProductPresentation } from "@/types";

interface Props {
    productId: number;
    // Lista ya conocida (viene con el producto); sin ella se pide al backend (líneas cargadas al editar)
    presentations?: ProductPresentation[];
    value?: number | null;
    // Factor guardado en la línea: respaldo si la presentación ya no aparece
    conversionFactor?: number | string | null;
}

// Presentación de la línea (ej. "Caja x12"). Se elige junto con el producto en el buscador; para cambiarla se vuelve a elegir
export const PresentationLabel = ({ productId, presentations: known, value, conversionFactor }: Props) => {
    const fetched = useProductPresentations(value && !known ? productId : null);
    if (!value) return null;

    const presentation = (known ?? fetched).find(p => p.id === value);
    const factor = presentation?.conversion_factor ?? conversionFactor;
    const name = presentation?.name ?? 'Presentación';

    return (
        <p className="mt-1 px-1 text-xs text-ink-3">
            {name}{factor ? ` (x${formatFactor(factor)})` : ''}
            {presentation?.active === false && <span className="ml-1">— inactiva</span>}
        </p>
    );
};
