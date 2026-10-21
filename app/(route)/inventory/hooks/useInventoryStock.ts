import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useInventory } from "@/lib/hooks/useInventory";
import { InventoryStockItem, Links, Meta } from "@/types";
import { getInventoryStock } from "../services/inventoryServices";
import { paginatorToMeta } from "../helpers/inventoryHelper";

export const useInventoryStock = () => {
    const [items, setItems] = useState<InventoryStockItem[]>([]);
    const [meta, setMeta] = useState<Meta | null>(null);
    const [links, setLinks] = useState<Links | null>(null);
    const [search, setSearch] = useState('');
    const [warehouseId, setWarehouseId] = useState('');
    const [belowMin, setBelowMin] = useState(false);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string>();
    const { status } = useSession();
    const { enabled } = useInventory();
    const axiosAuth = useAxiosAuth();

    const fetchStock = useCallback(async () => {
        if (status !== 'authenticated' || !enabled) return;
        setIsLoading(true);
        const { data, error } = await getInventoryStock(axiosAuth, {
            search,
            warehouse_id: warehouseId,
            below_min: belowMin ? 1 : undefined,
            paginate: 15,
            page,
        });
        setIsLoading(false);
        setError(error);
        if (data) {
            setItems(data.data);
            const { meta, links } = paginatorToMeta(data);
            setMeta(meta);
            setLinks(links);
        }
    }, [status, enabled, axiosAuth, search, warehouseId, belowMin, page]);

    // Espera a que se deje de escribir antes de buscar
    useEffect(() => {
        const timer = setTimeout(fetchStock, 300);
        return () => clearTimeout(timer);
    }, [fetchStock]);

    // Al cambiar un filtro se vuelve a la primera página
    const withReset = <T,>(setter: (value: T) => void) => (value: T) => {
        setter(value);
        setPage(1);
    };

    return {
        items, meta, links, search, warehouseId, belowMin, isLoading, error,
        setSearch: withReset(setSearch),
        setWarehouseId: withReset(setWarehouseId),
        setBelowMin: withReset(setBelowMin),
        setPage,
    };
};
