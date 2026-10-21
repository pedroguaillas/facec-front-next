"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { TableResponsive, TextInput } from "@/components";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useInventory } from "@/lib/hooks/useInventory";
import { formatDate, getDate } from "@/helpers/dateHelper";
import { InventoryValuation } from "@/types";
import { getValuation } from "../../services/inventoryServices";
import { formatMoney, formatQty } from "../../helpers/inventoryHelper";
import { useWarehouses } from "../../hooks/useWarehouses";
import { WarehouseFilter } from "./WarehouseFilter";
import { ExportButton } from "../../components/ExportButton";

export const ValuationReport = () => {
    const axiosAuth = useAxiosAuth();
    const { status } = useSession();
    const { enabled } = useInventory();
    const { warehouses } = useWarehouses();
    const [date, setDate] = useState(getDate());
    const [warehouseId, setWarehouseId] = useState('');
    const [report, setReport] = useState<InventoryValuation | null>(null);
    const [error, setError] = useState<string>();

    useEffect(() => {
        if (status !== 'authenticated' || !enabled || !date) return;
        getValuation(axiosAuth, { date, warehouse_id: warehouseId }).then(({ data, error }) => {
            setError(error);
            setReport(data ?? null);
        });
    }, [status, enabled, axiosAuth, date, warehouseId]);

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 rounded-xl border border-line bg-surface px-4 py-2 mt-4">
                <TextInput type="date" label="A la fecha" name="date" value={date} max={getDate()} onChange={(e) => setDate(e.target.value)} />
                <WarehouseFilter warehouses={warehouses} value={warehouseId} onChange={setWarehouseId} />
                {report && (
                    <div className="flex items-center justify-between sm:justify-end gap-4 my-2">
                        <div className="flex flex-col sm:text-right">
                            <span className="text-xs uppercase tracking-wide text-ink-3">Valor del inventario al {formatDate(report.date)}</span>
                            <span className="text-xl font-semibold tabular-nums">{formatMoney(report.total_value)}</span>
                        </div>
                        <ExportButton
                            url="inventory/valuation/export"
                            params={{ date, warehouse_id: warehouseId }}
                            fileName={`valorizacion-${date}.xlsx`}
                            disabled={report.items.length === 0}
                        />
                    </div>
                )}
            </div>
            {error && <p className="mt-3 text-sm text-red-500" role="alert">{error}</p>}
            <TableResponsive>
                <thead>
                    <tr>
                        <th>CÓDIGO</th>
                        <th className="text-left">PRODUCTO</th>
                        <th className="text-right">CANTIDAD</th>
                        <th className="text-right">COSTO PROM.</th>
                        <th className="text-right">VALOR</th>
                    </tr>
                </thead>
                <tbody>
                    {report?.items.length === 0 && (
                        <tr><td colSpan={5} className="py-8! text-ink-3">Sin existencias a esta fecha</td></tr>
                    )}
                    {report?.items.map(item => (
                        <tr key={item.product_id}>
                            <td>{item.code}</td>
                            <td className="text-left">{item.name}</td>
                            <td className="text-right tabular-nums">{formatQty(item.quantity)}</td>
                            <td className="text-right tabular-nums">{formatMoney(item.average_cost, 6)}</td>
                            <td className="text-right tabular-nums">{formatMoney(item.value)}</td>
                        </tr>
                    ))}
                </tbody>
                {report && report.items.length > 0 && (
                    <tfoot>
                        <tr className="border-t border-line font-semibold">
                            <td colSpan={4} className="text-right py-2.5 px-2.5">Total</td>
                            <td className="text-right tabular-nums py-2.5 px-2.5">{formatMoney(report.total_value)}</td>
                        </tr>
                    </tfoot>
                )}
            </TableResponsive>
        </>
    );
};
