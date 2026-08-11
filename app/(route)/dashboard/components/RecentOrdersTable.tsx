import { TableResponsive } from "@/components";
import { DashboardRecentOrder } from "@/types";
import Link from "next/link";

interface RecentOrdersTableProps {
    orders: DashboardRecentOrder[];
}

const calPrefix: Record<number, string> = {
    1: "FAC",
    4: "N/C",
    5: "N/D",
};

export const RecentOrdersTable = ({ orders }: RecentOrdersTableProps) => {
    if (!orders || orders.length === 0) return null;

    return (
        <div className="w-full p-4 bg-white dark:bg-slate-800 rounded shadow">
            <h2 className="text-xl font-bold mb-4 text-slate-700 dark:text-slate-200">Ventas recientes</h2>
            <TableResponsive>
                <thead>
                    <tr>
                        <th>F. EMISIÓN</th>
                        <th>DOCUMENTO</th>
                        <th className="text-left">CLIENTE</th>
                        <th>ESTADO</th>
                        <th className="text-right">TOTAL</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order, index) => (
                        <tr key={order.id} className={index % 2 === 0 ? "bg-gray-200 dark:bg-gray-900 rounded" : ""}>
                            <td>{order.date}</td>
                            <td>
                                <Link className="hover:underline cursor-pointer text-blue-500" href={`/orders/${order.id}`}>
                                    {`${calPrefix[order.voucher_type] ?? ""} ${order.serie}`}
                                </Link>
                            </td>
                            <td className="text-left uppercase">{order.customer?.name}</td>
                            <td>
                                <span
                                    className={`px-2 py-1 rounded-2xl text-xs inline-block
                                        ${order.state === "AUTORIZADO" ? "bg-green-700 text-white" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-300 dark:text-yellow-900"}
                                    `}
                                >
                                    {order.state || "CREADO"}
                                </span>
                            </td>
                            <td className="text-right">${order.total.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </TableResponsive>
        </div>
    );
};
