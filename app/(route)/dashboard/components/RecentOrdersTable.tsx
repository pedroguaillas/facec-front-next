import Link from "next/link";
import { FaArrowRight } from "react-icons/fa6";
import { SriStatus, TableResponsive } from "@/components";
import { DashboardRecentOrder } from "@/types";

interface RecentOrdersTableProps {
    orders: DashboardRecentOrder[];
}

const calPrefix: Record<number, string> = {
    1: "FAC",
    4: "N/C",
    5: "N/D",
};

const currency = (value: number) =>
    value.toLocaleString("es-EC", { style: "currency", currency: "USD" });

export const RecentOrdersTable = ({ orders }: RecentOrdersTableProps) => {
    if (!orders || orders.length === 0) return null;

    return (
        <section className="rounded-xl border border-line bg-surface p-5 lg:p-6">
            <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">Ventas recientes</p>
                <Link href="/orders" className="group inline-flex items-center gap-1.5 text-sm font-medium text-brand-ink">
                    Ver todas
                    <FaArrowRight className="text-xs transition-transform group-hover:translate-x-0.5" />
                </Link>
            </div>
            <div className="-mx-5 lg:-mx-6 [&>div]:my-2 [&>div]:border-0 [&>div]:rounded-none [&>div]:p-0">
                <TableResponsive>
                    <thead>
                        <tr>
                            <th className="text-left pl-5 lg:pl-6">Emisión</th>
                            <th className="text-left">Comprobante</th>
                            <th className="text-left">Cliente</th>
                            <th>Estado SRI</th>
                            <th className="text-right pr-5 lg:pr-6">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.id}>
                                <td className="text-left pl-5 lg:pl-6 text-ink-3 tabular-nums whitespace-nowrap">{order.date}</td>
                                <td className="text-left whitespace-nowrap">
                                    <Link className="font-mono text-[13px] text-brand-ink hover:underline underline-offset-2" href={`/orders/${order.id}`}>
                                        <span className="text-ink-3">{calPrefix[order.voucher_type] ?? ""}</span> {order.serie}
                                    </Link>
                                </td>
                                <td className="text-left">{order.customer?.name}</td>
                                <td><SriStatus state={order.state} /></td>
                                <td className="text-right pr-5 lg:pr-6 font-mono tabular-nums whitespace-nowrap">{currency(order.total)}</td>
                            </tr>
                        ))}
                    </tbody>
                </TableResponsive>
            </div>
        </section>
    );
};
