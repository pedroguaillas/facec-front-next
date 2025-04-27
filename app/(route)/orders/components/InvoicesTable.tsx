import { TableResponsive } from "@/components/table-responsive/TableResponsive";
import { useInvoices } from "../context/InvoicesContext";
import { useState } from "react";
import { Dropdown } from "./Dropdown";

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

    const calPrefix: Record<number, string> = {
        1: 'FAC',
        4: 'N/C',
        5: 'N/D',
    }

    return (
        <TableResponsive>
            <thead>
                <tr>
                    <th>F. EMISIÓN</th>
                    <th>DOCUMENTO</th>
                    <th className="text-left">CLIENTE</th>
                    <th>ESTADO</th>
                    <th className="text-right">TOTAL</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {invoices.map((order, index) => (
                    <tr key={order.id} className={index % 2 === 0 ? 'bg-gray-200 dark:bg-gray-900 rounded' : ''}>
                        <td>{order.atts.date}</td>
                        <td>{`${calPrefix[order.atts.voucher_type]} ${order.atts.serie}`}</td>
                        <td className="text-left uppercase">{order.customer?.name || "Desconocido"}</td>
                        <td>
                            <span className={order.atts?.state === 'AUTORIZADO' ? 'bg-green-700 px-2 py-1 text-gray-100 rounded-2xl' : ''}>
                                {order.atts?.state || "CREADO"}
                            </span>
                        </td>
                        <td className="text-right">${order.atts.total}</td>
                        <td className="w-4">
                            <Dropdown isOpen={dropdown[index]} index={index} order={order} setIsOpen={handleDrops} />
                        </td>
                    </tr>
                ))}
            </tbody>
        </TableResponsive>
    );
};

export default InvoicesTable;
