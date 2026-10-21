"use client";

import { useEffect, useState } from "react";
import useAxiosAuth from "./useAxiosAuth";
import { getPresentations } from "@/services/productPresentationServices";
import { ProductPresentation } from "@/types";

// Cache por producto mientras dura la página: varias líneas del mismo producto piden una sola vez
const cache = new Map<number, Promise<ProductPresentation[]>>();

export const invalidatePresentations = (productId: number) => cache.delete(productId);

// Presentaciones de un producto (vacío si no tiene o si no hay producto)
export const useProductPresentations = (productId?: number | string | null) => {
    const axiosAuth = useAxiosAuth();
    const id = Number(productId) || 0;
    const [presentations, setPresentations] = useState<ProductPresentation[]>([]);

    useEffect(() => {
        if (!id) {
            setPresentations([]);
            return;
        }
        let active = true;
        if (!cache.has(id)) {
            cache.set(id, getPresentations(axiosAuth, id).then(({ data }) => {
                // Si falla, no se queda en cache para reintentar en la próxima línea
                if (!data) cache.delete(id);
                return data?.data ?? [];
            }));
        }
        cache.get(id)!.then(list => {
            if (active) setPresentations(list);
        });
        return () => { active = false; };
    }, [id, axiosAuth]);

    return presentations;
};
