"use client";

import { FaCheckCircle, FaInfoCircle, FaMailBulk } from "react-icons/fa";
import { useShops } from "../context/ShopsContext"
import { TableResponsive } from "@/components"
import { Dropdown } from "./Dropdown";
import { useState } from "react";
import Link from "next/link";

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
                    <th>EMISION</th>
                    <th>DOCUMENTO</th>
                    <th className="text-left">RAZON SOCIAL</th>
                    <th>ESTADO RET</th>
                    <th className="text-right">TOTAL</th>
                    <th className="text-right">RET</th>
                    <th className="text-right">PAGAR</th>
                    <th>
                        <div className="flex justify-center">
                            <FaMailBulk />
                        </div>
                    </th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {shops.map((shop, index) => (
                    <tr key={shop.id} className={index % 2 === 0 ? 'bg-gray-200 dark:bg-gray-900 rounded' : ''}>
                        <td>{shop.atts.date}</td>
                        <td>
                            <Link className="hover:underline cursor-pointer text-blue-500" href={`/shops/${shop.id}`}>
                                {`${calPrefix[shop.atts.voucher_type]} ${shop.atts.serie}`}
                            </Link>
                        </td>
                        <td className="text-left">{shop.provider.name}</td>
                        <td className="text-center">
                            <div className="inline-flex relative justify-center items-center">
                                <span
                                    className={`relative px-2 py-1 rounded-2xl text-sm text-center inline-block
                                            ${shop.atts?.state_retencion === 'AUTORIZADO' ? 'bg-green-700 text-white' : ''}
                                            ${["NO AUTORIZADO", "EN PROCESO", "DEVUELTA"].includes(shop.atts?.state_retencion)
                                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-300 dark:text-yellow-900'
                                            : ''}
                                        `}
                                >
                                    {shop.atts?.state_retencion}

                                    {["NO AUTORIZADO", "EN PROCESO", "DEVUELTA"].includes(shop.atts?.state_retencion) && (
                                        <div className="absolute -top-1 -right-1 group">
                                            <FaInfoCircle className="text-gray-400 cursor-pointer" />
                                            <div className="absolute -top-6 right-0 bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                                                {shop.atts.extra_detail_retention}
                                            </div>
                                        </div>
                                    )}
                                </span>
                            </div>
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
                        <td>
                            {Number(shop.atts.send_mail_retention) === 1 && (
                                <div className="flex justify-center text-green-600/90">
                                    <FaCheckCircle />
                                </div>
                            )}
                        </td>
                        <td className="w-4">
                            <Dropdown index={index} shop={shop} isOpen={dropdown[index]} only={shops.length === 1 || index > shops.length - 5} setIsOpen={handleDrops} />
                        </td>
                    </tr>
                ))}
            </tbody>
        </TableResponsive>
    )
}
