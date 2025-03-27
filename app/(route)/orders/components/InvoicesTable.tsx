import { TableResponsive } from "@/components/table-responsive/TableResponsive";
import { useInvoices } from "../context/InvoicesContext";

const InvoicesTable = () => {
    const { invoices } = useInvoices();

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
                    <tr key={`order${index}`} className={index % 2 === 0 ? 'bg-gray-200 dark:bg-gray-900 rounded' : ''}>
                        <td>{order.atts?.date || "N/A"}</td>
                        <td>{order.atts?.serie || "N/A"}</td>
                        <td className="text-left uppercase">{order.customer?.name || "Desconocido"}</td>
                        <td>
                            <span className={order.atts?.state === 'AUTORIZADO' ? 'bg-green-700 px-2 py-1 text-gray-100 rounded-2xl' : ''}>
                                {order.atts?.state || "N/A"}
                            </span>
                        </td>
                        <td className="text-right">${order.atts?.total || "0.00"}</td>
                        <td className="flex justify-end relative">
                            {/* <Dropdown isOpen={dropdown[index]} index={index} order={order} setIsOpen={handleDrops} /> */}
                        </td>
                    </tr>
                ))}
            </tbody>
        </TableResponsive>
    );
};

export default InvoicesTable;
