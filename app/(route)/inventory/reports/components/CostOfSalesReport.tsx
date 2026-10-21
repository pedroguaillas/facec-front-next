"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { TableResponsive, TextInput } from "@/components";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useInventory } from "@/lib/hooks/useInventory";
import { getDate } from "@/helpers/dateHelper";
import { InventoryCostOfSales } from "@/types";
import { getCostOfSales } from "../../services/inventoryServices";
import { formatMoney, formatQty } from "../../helpers/inventoryHelper";
import { useWarehouses } from "../../hooks/useWarehouses";
import { WarehouseFilter } from "./WarehouseFilter";
import { ExportButton } from "../../components/ExportButton";

// Margen bruto sobre el ingreso, en %
const margin = (profit: number | string, revenue: number | string) =>
    Number(revenue) > 0 ? `${((Number(profit) / Number(revenue)) * 100).toFixed(1)}%` : '-';

export const CostOfSalesReport = () => {
    const axiosAuth = useAxiosAuth();
    const { status } = useSession();
    const { enabled } = useInventory();
    const { warehouses } = useWarehouses();
    const today = getDate();
    const [from, setFrom] = useState(`${today.slice(0, 7)}-01`);
    const [to, setTo] = useState(today);
    const [warehouseId, setWarehouseId] = useState('');
    const [report, setReport] = useState<InventoryCostOfSales | null>(null);
    const [error, setError] = useState<string>();

    useEffect(() => {
        // from y to son obligatorios
        if (status !== 'authenticated' || !enabled || !from || !to) return;
        getCostOfSales(axiosAuth, { from, to, warehouse_id: warehouseId }).then(({ data, error, errors }) => {
            setError(error ?? (errors ? Object.values(errors)[0] : undefined));
            setReport(data ?? null);
        });
    }, [status, enabled, axiosAuth, from, to, warehouseId]);

    const totals = report?.totals;

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 rounded-xl border border-line bg-surface px-4 py-2 mt-4">
                <TextInput type="date" label="Desde" name="from" value={from} max={to} onChange={(e) => setFrom(e.target.value)} />
                <TextInput type="date" label="Hasta" name="to" value={to} min={from} onChange={(e) => setTo(e.target.value)} />
                <WarehouseFilter warehouses={warehouses} value={warehouseId} onChange={setWarehouseId} />
                <div className="flex items-end justify-end my-2 sm:col-start-3">
                    <ExportButton
                        url="inventory/cost-of-sales/export"
                        params={{ from, to, warehouse_id: warehouseId }}
                        fileName={`costo-ventas-${from}-${to}.xlsx`}
                        disabled={!report || report.items.length === 0}
                    />
                </div>
            </div>

            {totals && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                    {[
                        { label: 'Ventas', value: totals.revenue },
                        { label: 'Costo de ventas', value: totals.cost },
                        { label: `Utilidad bruta (${margin(totals.gross_profit, totals.revenue)})`, value: totals.gross_profit },
                    ].map(card => (
                        <div key={card.label} className="rounded-xl border border-line bg-surface px-4 py-3">
                            <p className="text-xs uppercase tracking-wide text-ink-3">{card.label}</p>
                            <p className={`text-xl font-semibold tabular-nums ${Number(card.value) < 0 ? 'text-sri-fail' : ''}`}>{formatMoney(card.value)}</p>
                        </div>
                    ))}
                </div>
            )}

            {error && <p className="mt-3 text-sm text-red-500" role="alert">{error}</p>}

            <TableResponsive>
                <thead>
                    <tr>
                        <th>CÓDIGO</th>
                        <th className="text-left">PRODUCTO</th>
                        <th className="text-right">CANTIDAD</th>
                        <th className="text-right">VENTAS</th>
                        <th className="text-right">COSTO</th>
                        <th className="text-right">UTILIDAD</th>
                        <th className="text-right">MARGEN</th>
                    </tr>
                </thead>
                <tbody>
                    {report?.items.length === 0 && (
                        <tr><td colSpan={7} className="py-8! text-ink-3">Sin ventas de productos en el periodo</td></tr>
                    )}
                    {report?.items.map(item => (
                        <tr key={item.product_id}>
                            <td>{item.code}</td>
                            <td className="text-left">{item.name}</td>
                            <td className="text-right tabular-nums">{formatQty(item.quantity)}</td>
                            <td className="text-right tabular-nums">{formatMoney(item.revenue)}</td>
                            <td className="text-right tabular-nums">{formatMoney(item.cost)}</td>
                            <td className={`text-right tabular-nums ${Number(item.gross_profit) < 0 ? 'text-sri-fail' : ''}`}>{formatMoney(item.gross_profit)}</td>
                            <td className="text-right tabular-nums text-ink-3">{margin(item.gross_profit, item.revenue)}</td>
                        </tr>
                    ))}
                </tbody>
            </TableResponsive>
        </>
    );
};
