"use client";

import { FaCheckCircle, FaEnvelope } from "react-icons/fa";
import { useShops } from "../context/ShopsContext"
import { SriStatus, TableResponsive, VoucherSerie } from "@/components"
import { Dropdown } from "./Dropdown";
import { useState } from "react";
import { formatDate } from "@/helpers/dateHelper";

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

    return (
        <TableResponsive>
            <thead>
                <tr>
                    <th className="text-left">Emisión</th>
                    <th className="text-left">Documento</th>
                    <th className="text-left">Proveedor</th>
                    <th>Retención</th>
                    <th className="text-right">Total</th>
                    <th className="text-right">Ret.</th>
                    <th className="text-right">A pagar</th>
                    <th className="w-8">
                        <span className="flex justify-center" title="Retención enviada por correo">
                            <FaEnvelope aria-label="Retención enviada por correo" />
                        </span>
                    </th>
                    <th className="w-10"><span className="sr-only">Acciones</span></th>
                </tr>
            </thead>
            <tbody>
                {shops.map((shop, index) => {
                    const total = Number(shop.atts.total);
                    const retention = Number(shop.atts.retention ?? 0);
                    const hasDetail = ["NO AUTORIZADO", "EN PROCESO", "DEVUELTA"].includes(shop.atts?.state_retencion);
                    // Crédito con saldo por pagar, sin la retención (misma regla que "Registrar pago"); la anulada no se paga
                    const pending = shop.atts.payment_type === "CREDITO" && shop.atts.state !== "ANULADO"
                        ? Number((total - retention - Number(shop.atts.paid ?? 0)).toFixed(2)) : 0;
                    return (
                    <tr key={shop.id} className={pending > 0 ? "bg-sri-wait-soft" : undefined}>
                        <td className="text-left whitespace-nowrap tabular-nums text-ink-2">{formatDate(shop.atts.date)}</td>
                        <td className="text-left">
                            <VoucherSerie serie={shop.atts.serie} href={`/shops/${shop.id}`} />
                        </td>
                        <td className="text-left min-w-48">{shop.provider.name}</td>
                        <td>
                            {shop.atts?.state_retencion
                                ? <SriStatus state={shop.atts.state_retencion} detail={hasDetail ? shop.atts.extra_detail_retention : null} />
                                : <span className="text-ink-4">—</span>}
                        </td>
                        <td className="text-right whitespace-nowrap tabular-nums">{total.toFixed(2)}</td>
                        <td className={`text-right whitespace-nowrap tabular-nums ${retention > 0 ? 'text-ink-2' : 'text-ink-4'}`}>{retention.toFixed(2)}</td>
                        <td className="text-right whitespace-nowrap tabular-nums font-medium">
                            {(total - retention).toFixed(2)}
                            {pending > 0 && <span className="block text-xs font-normal text-sri-wait">Pendiente {pending.toFixed(2)}</span>}
                        </td>
                        <td>
                            {Number(shop.atts.send_mail_retention) === 1 && (
                                <span className="flex justify-center text-sri-ok" title="Retención enviada por correo">
                                    <FaCheckCircle aria-label="Retención enviada por correo" />
                                </span>
                            )}
                        </td>
                        <td>
                            <Dropdown index={index} shop={shop} isOpen={dropdown[index]} only={shops.length === 1 || index > shops.length - 5} setIsOpen={handleDrops} />
                        </td>
                    </tr>
                    );
                })}
            </tbody>
        </TableResponsive>
    )
}
