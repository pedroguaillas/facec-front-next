"use client";

import { TableResponsive } from "@/components"
import { useShops } from "../context/ShopsContext"
import { Dropdown } from "./Dropdown";
import { useState } from "react";

export const ShopsTable = () => {

    const { shops } = useShops();
    const [dropdown, setDropdown] = useState<boolean[]>([]);

    // ✅ Cierra todos los dropdowns excepto el seleccionado
    const handleDrops = (index: number | null) => {
        setDropdown((prev) => {
            const newDropdown = Array(prev.length).fill(false); // 🔴 Cierra todos los dropdowns
            if (index !== null)
                newDropdown[index] = !prev[index]; // 🟢 Alterna solo el seleccionado
            return newDropdown;
        });
    };

    const calPrefix: Record<number, string> = {
        1: 'FAC',
        2: 'N/V',
        3: 'L/C',
        5: 'N/D',
    }

    return (
        <TableResponsive>
            <thead>
                <tr>
                    <th>Emisión</th>
                    <th>Documento</th>
                    <th className="text-left">Razon social</th>
                    <th>Estado Ret</th>
                    <th className="text-right">Total</th>
                    <th className="text-right">Ret</th>
                    <th className="text-right">Pagar</th>
                    <th></th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {shops.map((shop, index) => (
                    <tr key={shop.id} className={index % 2 === 0 ? 'bg-gray-200 dark:bg-gray-900 rounded' : ''}>
                        <td>{shop.atts.date}</td>
                        <td>{`${calPrefix[shop.atts.voucher_type]} ${shop.atts.serie}`}</td>
                        <td className="text-left">{shop.provider.name}</td>
                        <td>
                            <span className={shop.atts?.state_retencion === 'AUTORIZADO' ? 'bg-green-700 px-2 py-1 text-gray-100 rounded-2xl' : ''}>
                                {shop.atts.state_retencion || "CREADO"}
                            </span>
                        </td>
                        <td className="text-right">{parseFloat(shop.atts.total.toString()).toFixed(2)}</td>
                        <td className="text-right">{shop.atts.retention ?? '0.00'}</td>
                        <td className="text-right">
                            {(
                                parseFloat(shop.atts.total.toString()) -
                                parseFloat(
                                    typeof shop.atts.retention === 'string' ? shop.atts.retention : (
                                        shop.atts.retention === null ? '0.00' :
                                            // Este caso significa que es un number toca hacer string
                                            '' + shop.atts.retention
                                    )
                                )
                            ).toFixed(2)}
                        </td>
                        <td></td>
                        <td className="w-4">
                            <Dropdown index={index} shop={shop} isOpen={dropdown[index]} setIsOpen={handleDrops} />
                        </td>
                    </tr>
                ))}
            </tbody>
        </TableResponsive>
    )
}
