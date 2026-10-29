"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components";
import { characteristicsText } from "@/helpers/productTemplateHelper";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { getUnits } from "@/services/productUnitServices";
import { ProductProps, ProductUnit } from "@/types";

interface Props {
    product: ProductProps;
    // Unidades ya puestas en otras líneas: no se repiten
    excludeIds: number[];
    onSelect: (unit: ProductUnit) => void;
    onClose: () => void;
    // Solo donde la unidad es opcional (guía de remisión): usar el modelo sin unidad
    onSkip?: () => void;
}

// Al vender un modelo con campos por unidad (ej. moto) se elige la unidad: chasis, motor
export const UnitPickerModal = ({ product, excludeIds, onSelect, onClose, onSkip }: Props) => {
    const axiosAuth = useAxiosAuth();
    const [units, setUnits] = useState<ProductUnit[] | null>(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        let active = true;
        getUnits(axiosAuth, product.id).then(({ data }) => {
            // Solo en stock (sin inventario el backend pone 0 a las vendidas)
            if (active) setUnits((data ?? []).filter(unit => unit.stock === null || Number(unit.stock) > 0));
        });
        return () => { active = false; };
    }, [axiosAuth, product.id]);

    const term = search.trim().toLowerCase();
    const available = (units ?? [])
        .filter(unit => !excludeIds.includes(unit.id))
        .filter(unit => !term || `${unit.code} ${characteristicsText(unit.characteristics)}`.toLowerCase().includes(term));

    return (
        <Modal isOpen onClose={onClose} title="Selecciona la unidad" subtitle={`${product.atts.code} - ${product.atts.name}`} modalSize="md">
            <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por código, chasis, motor…"
                aria-label="Buscar unidad"
                autoFocus
                className="w-full border border-line-strong rounded-md px-3 py-2 text-sm bg-[var(--background)] text-ink-1 focus:outline-none focus:border-primary"
            />
            {units === null ? (
                <p className="py-4 text-sm text-ink-3">Cargando…</p>
            ) : available.length === 0 ? (
                <p className="py-4 text-sm text-ink-3">
                    {units.length === 0 ? 'No hay unidades en stock de este producto.' : 'Ninguna unidad coincide.'}
                </p>
            ) : (
                <ul className="mt-3 divide-y divide-line border-y border-line max-h-80 overflow-y-auto">
                    {available.map(unit => (
                        <li key={unit.id}>
                            <button
                                type="button"
                                onClick={() => onSelect(unit)}
                                className="w-full text-left px-2 py-2.5 hover:bg-surface cursor-pointer"
                            >
                                <span className="font-medium text-ink-1 tabular-nums">{unit.code}</span>
                                {characteristicsText(unit.characteristics) && (
                                    <span className="block text-xs text-ink-3">{characteristicsText(unit.characteristics)}</span>
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            {onSkip && (
                <button type="button" onClick={onSkip} className="mt-3 text-sm text-primary hover:underline cursor-pointer">
                    Usar el modelo sin unidad
                </button>
            )}
        </Modal>
    );
};
