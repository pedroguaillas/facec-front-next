import { TableResponsive } from "@/components/table-responsive/TableResponsive";
import { FaCheckCircle, FaInfoCircle, FaMailBulk } from "react-icons/fa";
import { useInvoices } from "../context/InvoicesContext";
import { Dropdown } from "./Dropdown";
import { useState } from "react";
import Link from "next/link";

const InvoicesTable = () => {
    const { invoices } = useInvoices();
    const [dropdown, setDropdown] = useState<boolean[]>([]);

    const calPrefix: Record<number, string> = {
        1: 'FAC',
        4: 'N/C',
        5: 'N/D',
    }

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
                    <th>F. EMISIÓN</th>
                    <th>DOCUMENTO</th>
                    <th className="text-left">CLIENTE</th>
                    <th>ESTADO</th>
                    <th className="text-right">TOTAL</th>
                    <th>
                        <div className="flex justify-center">
                            <FaMailBulk />
                        </div>
                    </th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {invoices.map((order, index) => (
                    <tr key={order.id} className={index % 2 === 0 ? 'bg-gray-200 dark:bg-gray-900 rounded' : ''}>
                        <td>{order.atts.date}</td>
                        <td>
                            <Link className="hover:underline cursor-pointer text-blue-500" href={`/orders/${order.id}`}>
                                {`${calPrefix[order.atts.voucher_type]} ${order.atts.serie}`}
                            </Link>
                        </td>
                        <td className="text-left uppercase">{order.customer?.name}</td>
                        <td className="text-center">
                            <div className="inline-flex relative justify-center items-center">
                                <span
                                    className={`relative px-2 py-1 rounded-2xl text-sm text-center inline-block
                                            ${order.atts?.state === 'AUTORIZADO' ? 'bg-green-700 text-white' : ''}
                                            ${["NO AUTORIZADO", "EN PROCESO", "DEVUELTA"].includes(order.atts?.state)
                                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-300 dark:text-yellow-900'
                                            : ''}
                                        `}
                                >
                                    {order.atts?.state || "CREADO"}

                                    {["NO AUTORIZADO", "EN PROCESO", "DEVUELTA"].includes(order.atts?.state) && (
                                        <div className="absolute -top-1 -right-1 group">
                                            <FaInfoCircle className="text-gray-400 cursor-pointer" />
                                            <div className="absolute -top-6 right-0 bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                                                {order.atts.extra_detail}
                                            </div>
                                        </div>
                                    )}
                                </span>
                            </div>
                        </td>

                        <td className="text-right">${order.atts.total.toFixed(2)}</td>
                        <td>
                            {Number(order.atts.send_mail) === 1 && (
                                <div className="flex justify-center text-green-600/90">
                                    <FaCheckCircle />
                                </div>
                            )}
                        </td>
                        <td className="w-4">
                            <Dropdown isOpen={dropdown[index]} index={index} order={order} only={invoices.length === 1 || index > invoices.length - 5} setIsOpen={handleDrops} />
                        </td>
                    </tr>
                ))}
            </tbody>
        </TableResponsive>
    );
};

export default InvoicesTable;
