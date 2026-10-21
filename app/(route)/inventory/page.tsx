"use client";

import { FaSearch } from "react-icons/fa";
import { Paginate, Switch } from "@/components";
import { InventoryShell } from "./components/InventoryShell";
import { StockTable } from "./components/StockTable";
import { useInventoryStock } from "./hooks/useInventoryStock";
import { useWarehouses } from "./hooks/useWarehouses";
import { pageFromUrl } from "./helpers/inventoryHelper";
import { ExportButton } from "./components/ExportButton";
import { getDate } from "@/helpers/dateHelper";

const PageInventoryStock = () => {
    const {
        items, meta, links, search, warehouseId, belowMin, isLoading, error,
        setSearch, setWarehouseId, setBelowMin, setPage,
    } = useInventoryStock();
    const { warehouses } = useWarehouses();

    const handlePageChange = (e: React.MouseEvent<HTMLButtonElement>, url: string) => {
        e.preventDefault();
        setPage(pageFromUrl(url));
    };

    return (
        <InventoryShell
            title="Inventario"
            subTitle="Stock, costo promedio y valor por producto"
            actions={[
                { label: "Ajuste", type: "link", url: "/inventory/adjustments", action: "add" },
            ]}
        >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 mt-4">
                <Switch name="below_min" label="Solo bajo mínimo" checked={belowMin} onChange={(e) => setBelowMin(e.target.checked)} />
                {warehouses.length > 1 && (
                    <select
                        value={warehouseId}
                        onChange={(e) => setWarehouseId(e.target.value)}
                        aria-label="Bodega"
                        className="rounded-lg border border-[var(--border-strong)] px-3 py-1.5 text-sm bg-[var(--background)] dark:text-gray-300"
                    >
                        <option value="">Todas las bodegas</option>
                        {warehouses.map(warehouse => (
                            <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                        ))}
                    </select>
                )}
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                        <FaSearch />
                    </span>
                    <input
                        className="w-full rounded pl-8 pr-2 py-1 bg-gray-50 dark:bg-gray-800 dark:focus:border-gray-500 dark:hover:border-gray-500"
                        type="search"
                        placeholder="Buscar productos ..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <ExportButton
                    url="inventory/stock/export"
                    params={{ search, warehouse_id: warehouseId, below_min: belowMin ? 1 : undefined }}
                    fileName={`inventario-stock-${getDate()}.xlsx`}
                />
            </div>
            {error && <p className="mt-3 text-sm text-red-500" role="alert">{error}</p>}
            <StockTable items={items} isLoading={isLoading} />
            <Paginate meta={meta} links={links} reqNewPage={handlePageChange} />
        </InventoryShell>
    );
};

export default PageInventoryStock;
