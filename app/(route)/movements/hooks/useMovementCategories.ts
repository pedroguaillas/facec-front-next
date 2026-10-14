"use client";

import { useEffect, useState } from "react";
import { AxiosInstance } from "axios";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { getMovementCategories } from "@/services/movementServices";
import { MovementCategoryGroup, MovementCategoryInfo, MovementType } from "@/types";

// El catálogo es fijo: se pide una vez por carga de la app y se comparte entre selectores
let cache: Promise<MovementCategoryInfo[]> | null = null;

const loadCategories = (axiosAuth: AxiosInstance) => {
    cache ??= getMovementCategories(axiosAuth).then(({ data }) => {
        // Acepta el arreglo directo o envuelto en { data }
        const list = Array.isArray(data) ? data : (data as unknown as { data?: MovementCategoryInfo[] })?.data ?? [];
        if (list.length === 0) cache = null; // reintenta en el próximo uso si falló
        return list;
    });
    return cache;
};

export const useMovementCategories = () => {
    const axiosAuth = useAxiosAuth();
    const [categories, setCategories] = useState<MovementCategoryInfo[]>([]);

    useEffect(() => {
        let active = true;
        loadCategories(axiosAuth).then(list => { if (active) setCategories(list); });
        return () => { active = false; };
    }, [axiosAuth]);

    // Categorías válidas para el tipo, agrupadas: primero las del negocio
    const groupedFor = (type: MovementType) => {
        const groups: Record<MovementCategoryGroup, MovementCategoryInfo[]> = { NEGOCIO: [], FINANCIAMIENTO: [] };
        categories.filter(it => it.type === type).forEach(it => groups[it.group].push(it));
        return (['NEGOCIO', 'FINANCIAMIENTO'] as const)
            .map(group => ({ group, items: groups[group] }))
            .filter(it => it.items.length > 0);
    };

    return { categories, groupedFor };
};
