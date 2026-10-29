"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import useAxiosAuth from "./useAxiosAuth";
import { getProductTemplates } from "@/services/productTemplateServices";
import { ProductTemplate } from "@/types";

// Cache mientras dura la página: todas las líneas de la compra comparten una sola petición.
// Va atado al token: otra sesión (cerrar sesión y entrar con otra empresa) vuelve a pedirlas
let cache: { token: string; list: Promise<ProductTemplate[]> } | null = null;

// Al guardar o eliminar plantillas en Configuración
export const invalidateProductTemplates = () => { cache = null; };

// Plantillas de características de la empresa (ej. Moto con Chasis y Motor por unidad)
export const useProductTemplates = () => {
    const axiosAuth = useAxiosAuth();
    const token = useSession().data?.user.token;
    const [templates, setTemplates] = useState<ProductTemplate[]>([]);

    useEffect(() => {
        if (!token) return;
        let active = true;
        if (cache?.token !== token) {
            const list = getProductTemplates(axiosAuth).then(({ data }) => {
                // Si falla, no se queda en cache para reintentar
                if (!data && cache?.list === list) cache = null;
                return data ?? [];
            });
            cache = { token, list };
        }
        const { list } = cache ?? {};
        list?.then(items => {
            if (active) setTemplates(items);
        });
        return () => { active = false; };
    }, [axiosAuth, token]);

    return templates;
};
