"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Paginate, TableResponsive, TextInput } from "@/components";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useInventory } from "@/lib/hooks/useInventory";
import { formatDate } from "@/helpers/dateHelper";
import { InventoryMovement, Links, Meta, Product } from "@/types";
import { getEditProduct } from "../../products/services/productServices";
import { getKardex } from "../services/inventoryServices";
import { documentUrl, formatMoney, formatQty, isReversal, pageFromUrl } from "../helpers/inventoryHelper";
import { useWarehouses } from "../hooks/useWarehouses";
import { InventoryShell } from "./InventoryShell";
import { ExportButton } from "./ExportButton";

interface Props {
    productId: string;
    initialWarehouseId: string;
}

export const KardexView = ({ productId, initialWarehouseId }: Props) => {
    const [movements, setMovements] = useState<InventoryMovement[]>([]);
    const [meta, setMeta] = useState<Meta | null>(null);
    const [links, setLinks] = useState<Links | null>(null);
    const [product, setProduct] = useState<Product | null>(null);
    const [warehouseId, setWarehouseId] = useState(initialWarehouseId);
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string>();
    const { status } = useSession();
    const { enabled } = useInventory();
    const { warehouses } = useWarehouses();
    const axiosAuth = useAxiosAuth();

    useEffect(() => {
        if (status !== 'authenticated') return;
        getEditProduct(productId, axiosAuth).then(({ data }) => {
            if (data) setProduct(data.product);
        });
    }, [status, axiosAuth, productId]);

    const fetchKardex = useCallback(async () => {
        if (status !== 'authenticated' || !enabled) return;
        setIsLoading(true);
        const { data, error } = await getKardex(axiosAuth, productId, { warehouse_id: warehouseId, from, to, paginate: 50, page });
        setIsLoading(false);
        setError(error);
        if (data) {
            setMovements(data.data);
            setMeta(data.meta);
            setLinks(data.links);
        }
    }, [status, enabled, axiosAuth, productId, warehouseId, from, to, page]);

    useEffect(() => {
        fetchKardex();
    }, [fetchKardex]);

    // Movimientos anulados por una reversa de esta página: también van atenuados
    const reversedIds = new Set(movements.map(m => m.reverses_id).filter((id): id is number => id !== null));

    const handlePageChange = (e: React.MouseEvent<HTMLButtonElement>, url: string) => {
        e.preventDefault();
        setPage(pageFromUrl(url));
    };

    const showWarehouse = warehouses.length > 1 && !warehouseId;

    return (
        <InventoryShell
            title={product ? `Kardex: ${product.code} - ${product.name}` : 'Kardex'}
            subTitle="Movimientos del producto en orden de registro"
            actions={[
                { label: "Regresar", type: "link", url: "/inventory", action: "back" },
                { label: "Ajuste", type: "link", url: `/inventory/adjustments?product_id=${productId}`, action: "add" },
            ]}
            hideTabs
        >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 rounded-xl border border-line bg-surface px-4 py-2 mt-4">
                {warehouses.length > 1 && (
                    <div className="flex flex-col gap-1 my-2">
                        <label htmlFor="kardex-warehouse" className="text-sm font-medium">Bodega</label>
                        <select
                            id="kardex-warehouse"
                            value={warehouseId}
                            onChange={(e) => { setWarehouseId(e.target.value); setPage(1); }}
                            className="border rounded-lg px-3 py-2 text-sm bg-[var(--background)] border-[var(--border-strong)] dark:text-gray-300"
                        >
                            <option value="">Todas</option>
                            {warehouses.map(warehouse => (
                                <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                            ))}
                        </select>
                    </div>
                )}
                <TextInput type="date" label="Desde" name="from" value={from} max={to || undefined} onChange={(e) => { setFrom(e.target.value); setPage(1); }} />
                <TextInput type="date" label="Hasta" name="to" value={to} min={from || undefined} onChange={(e) => { setTo(e.target.value); setPage(1); }} />
                <div className="flex items-end justify-end my-2 sm:col-start-3">
                    <ExportButton
                        url={`products/${productId}/kardex/export`}
                        params={{ warehouse_id: warehouseId, from, to }}
                        fileName={`kardex-${product?.code ?? productId}.xlsx`}
                        disabled={movements.length === 0}
                    />
                </div>
            </div>

            {error && <p className="mt-3 text-sm text-red-500" role="alert">{error}</p>}

            <TableResponsive>
                <thead>
                    <tr>
                        <th>FECHA</th>
                        <th className="text-left">TIPO</th>
                        <th className="text-left">DOCUMENTO</th>
                        {showWarehouse && <th className="text-left">BODEGA</th>}
                        <th className="text-right">ENTRADA</th>
                        <th className="text-right">SALIDA</th>
                        <th className="text-right">COSTO UNIT.</th>
                        <th className="text-right">SALDO</th>
                        <th className="text-right">COSTO PROM.</th>
                        <th className="text-right">VALOR</th>
                    </tr>
                </thead>
                <tbody>
                    {!isLoading && movements.length === 0 && (
                        <tr>
                            <td colSpan={showWarehouse ? 10 : 9} className="py-8! text-ink-3">Sin movimientos</td>
                        </tr>
                    )}
                    {movements.map(movement => {
                        const muted = isReversal(movement) || reversedIds.has(movement.id);
                        const url = documentUrl(movement.document);
                        return (
                            <tr key={movement.id} className={muted ? 'text-ink-4' : ''} title={movement.user ? `Registrado por ${movement.user}` : undefined}>
                                <td className="whitespace-nowrap">{formatDate(movement.date)}</td>
                                <td className="text-left whitespace-nowrap">{movement.type}</td>
                                <td className="text-left">
                                    {url ? (
                                        <Link href={url} className="text-primary hover:underline whitespace-nowrap">
                                            {movement.document?.type === 'order' ? 'Venta' : 'Compra'} {movement.document?.serie ?? `#${movement.document?.id}`}
                                        </Link>
                                    ) : (
                                        <span className="text-ink-3">{movement.note ?? '-'}</span>
                                    )}
                                </td>
                                {showWarehouse && <td className="text-left">{movement.warehouse}</td>}
                                <td className="text-right tabular-nums">{movement.direction === 'in' ? formatQty(movement.quantity) : ''}</td>
                                <td className="text-right tabular-nums">{movement.direction === 'out' ? formatQty(movement.quantity) : ''}</td>
                                <td className="text-right tabular-nums">{movement.unit_cost !== null ? formatMoney(movement.unit_cost, 6) : ''}</td>
                                <td className={`text-right tabular-nums font-medium ${Number(movement.new_balance) < 0 ? 'text-sri-fail' : ''}`}>{formatQty(movement.new_balance)}</td>
                                <td className="text-right tabular-nums">{formatMoney(movement.average_cost, 6)}</td>
                                <td className="text-right tabular-nums">{formatMoney(movement.balance_value)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </TableResponsive>
            <Paginate meta={meta} links={links} reqNewPage={handlePageChange} />
        </InventoryShell>
    );
};
