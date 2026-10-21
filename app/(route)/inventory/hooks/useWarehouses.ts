import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useInventory } from "@/lib/hooks/useInventory";
import { Warehouse } from "@/types";
import { getWarehouses } from "../services/inventoryServices";

// Bodegas de la sucursal; la primera es la bodega por defecto (ventas y compras)
export const useWarehouses = () => {
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { status } = useSession();
    const { enabled } = useInventory();
    const axiosAuth = useAxiosAuth();

    const fetchWarehouses = useCallback(async () => {
        if (status !== 'authenticated' || !enabled) return;
        setIsLoading(true);
        const { data } = await getWarehouses(axiosAuth);
        if (data) setWarehouses(data);
        setIsLoading(false);
    }, [status, enabled, axiosAuth]);

    useEffect(() => {
        fetchWarehouses();
    }, [fetchWarehouses]);

    const options = warehouses.map((warehouse, index) => ({
        value: warehouse.id,
        label: index === 0 ? `${warehouse.name} (por defecto)` : warehouse.name,
    }));

    return { warehouses, options, isLoading, fetchWarehouses };
};
