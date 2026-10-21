"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import { IconButton, TableResponsive } from "@/components";
import { InventoryStockItem } from "@/types";
import { formatMoney, formatQty } from "../helpers/inventoryHelper";

interface Props {
    items: InventoryStockItem[];
    isLoading: boolean;
}

export const StockTable = ({ items, isLoading }: Props) => {
    const [expanded, setExpanded] = useState<number | null>(null);

    return (
        <TableResponsive>
            <thead>
                <tr>
                    <th className="w-1"></th>
                    <th>CÓDIGO</th>
                    <th className="text-left">PRODUCTO</th>
                    <th className="text-right">STOCK</th>
                    <th className="text-right">MÍNIMO</th>
                    <th className="text-right">COSTO PROM.</th>
                    <th className="text-right">VALOR</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {!isLoading && items.length === 0 && (
                    <tr>
                        <td colSpan={8} className="py-8! text-ink-3">No hay productos para mostrar</td>
                    </tr>
                )}
                {items.map(item => {
                    const isOpen = expanded === item.id;
                    const stock = Number(item.stock);
                    return (
                        <Fragment key={item.id}>
                            <tr>
                                <td>
                                    {item.warehouses.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setExpanded(isOpen ? null : item.id)}
                                            aria-expanded={isOpen}
                                            aria-label={isOpen ? 'Ocultar bodegas' : 'Ver stock por bodega'}
                                            className="p-2 rounded-md text-ink-3 hover:text-primary cursor-pointer"
                                        >
                                            {isOpen ? <FaChevronDown className="text-xs" /> : <FaChevronRight className="text-xs" />}
                                        </button>
                                    )}
                                </td>
                                <td>{item.code}</td>
                                <td className="text-left">
                                    <Link href={`/inventory/kardex/${item.id}`} className="hover:text-primary hover:underline">{item.name}</Link>
                                    {item.below_min && (
                                        <span className="ml-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase bg-sri-fail-soft text-sri-fail">
                                            Bajo mínimo
                                        </span>
                                    )}
                                </td>
                                <td className={`text-right tabular-nums font-medium ${stock < 0 ? 'text-sri-fail' : ''}`}>{formatQty(item.stock)}</td>
                                <td className="text-right tabular-nums text-ink-3">{item.min_stock !== null ? formatQty(item.min_stock) : '-'}</td>
                                <td className="text-right tabular-nums">{formatMoney(item.average_cost, 6)}</td>
                                <td className="text-right tabular-nums">{formatMoney(item.value)}</td>
                                <td className="w-1">
                                    <IconButton type="link" action="view" url={`/inventory/kardex/${item.id}`} title="Kardex" />
                                </td>
                            </tr>
                            {isOpen && item.warehouses.map(warehouse => (
                                <tr key={`${item.id}-${warehouse.warehouse_id}`} className="bg-surface-sunken text-ink-2">
                                    <td></td>
                                    <td></td>
                                    <td className="text-left pl-6!">{warehouse.name}</td>
                                    <td className="text-right tabular-nums">{formatQty(warehouse.stock)}</td>
                                    <td></td>
                                    <td className="text-right tabular-nums">{formatMoney(warehouse.average_cost, 6)}</td>
                                    <td className="text-right tabular-nums">{formatMoney(warehouse.value)}</td>
                                    <td className="w-1">
                                        <IconButton type="link" action="view" url={`/inventory/kardex/${item.id}?warehouse_id=${warehouse.warehouse_id}`} title="Kardex de esta bodega" />
                                    </td>
                                </tr>
                            ))}
                        </Fragment>
                    );
                })}
            </tbody>
        </TableResponsive>
    );
};
