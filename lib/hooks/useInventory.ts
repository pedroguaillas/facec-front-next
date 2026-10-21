"use client";

import { useSession } from "next-auth/react";

// Módulo de inventario (kardex) según los permisos del login. Los admin reciben `permissions: []`.
export const useInventory = () => {
    const { data: session, status } = useSession();
    const permissions = session?.user?.permissions;
    const isCompany = !!permissions && !Array.isArray(permissions);

    return {
        isLoading: status === 'loading',
        // Lo activa solo el admin
        enabled: isCompany && !!permissions.inventory,
        // Con inventario y sin esto, vender más de lo disponible responde 422
        allowNegativeStock: isCompany && !!permissions.allow_negative_stock,
    };
};
