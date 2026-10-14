import { TableResponsive } from "@/components/table-responsive/TableResponsive";
import { FaCheckCircle, FaEnvelope } from "react-icons/fa";
import { SriStatus, VoucherSerie } from "@/components";
import { formatDate } from "@/helpers/dateHelper";
import { useInvoices } from "../context/InvoicesContext";
import { Dropdown } from "./Dropdown";
import { useState } from "react";
import { ORDER_SERIE_PREFIX } from "@/constants";

const InvoicesTable = () => {
    const { invoices } = useInvoices();
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
                    <th className="text-left">Cliente</th>
                    <th>Estado</th>
                    <th className="text-right">Total</th>
                    <th className="w-8">
                        <span className="flex justify-center" title="Enviado por correo">
                            <FaEnvelope aria-label="Enviado por correo" />
                        </span>
                    </th>
                    <th className="w-10"><span className="sr-only">Acciones</span></th>
                </tr>
            </thead>
            <tbody>
                {invoices.map((order, index) => {
                    const seriePrefix = order.atts.serie?.trim().split(" ")[0] ?? "";
                    const isElectronic = seriePrefix === ORDER_SERIE_PREFIX.FACTURA || seriePrefix === ORDER_SERIE_PREFIX.NOTA_CREDITO;
                    const hasDetail = ["NO AUTORIZADO", "EN PROCESO", "DEVUELTA"].includes(order.atts?.state);
                    return (
                    <tr key={order.id}>
                        <td className="text-left whitespace-nowrap tabular-nums text-ink-2">{formatDate(order.atts.date)}</td>
                        <td className="text-left">
                            <VoucherSerie serie={order.atts?.serie} href={`/orders/${order.id}`} />
                        </td>
                        <td className="text-left min-w-48">{order.customer?.name}</td>
                        <td>
                            <SriStatus state={order.atts?.state} isElectronic={isElectronic} detail={hasDetail ? order.atts.extra_detail : null} />
                        </td>
                        <td className="text-right whitespace-nowrap tabular-nums font-medium">${order.atts.total.toFixed(2)}</td>
                        <td>
                            {Number(order.atts.send_mail) === 1 && (
                                <span className="flex justify-center text-sri-ok" title="Enviado por correo">
                                    <FaCheckCircle aria-label="Enviado por correo" />
                                </span>
                            )}
                        </td>
                        <td>
                            <Dropdown isOpen={dropdown[index]} index={index} order={order} only={invoices.length === 1 || index > invoices.length - 5} setIsOpen={handleDrops} />
                        </td>
                    </tr>
                    );
                })}
            </tbody>
        </TableResponsive>
    );
};

export default InvoicesTable;
