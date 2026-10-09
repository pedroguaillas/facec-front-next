import Link from "next/link";
import { FaArrowRight, FaCircleCheck } from "react-icons/fa6";
import { ordersStateUrl, SRI_PENDING_STATES, SRI_REJECTED_STATES } from "@/constants/sriStates";
import { DashboardSri } from "@/types";

interface Props {
    sri: DashboardSri;
}

const typeLabels: Record<keyof DashboardSri['by_type'], [string, string]> = {
    orders: ['venta', 'ventas'],
    shops: ['liquidación', 'liquidaciones'],
    retentions: ['retención', 'retenciones'],
    referralguides: ['guía', 'guías'],
};

const formatDate = (date: string) => {
    const [y, m, d] = date.split('-');
    return `${d}/${m}/${y}`;
};

// "2 ventas · 1 retención"
const breakdown = (sri: DashboardSri, key: 'pending' | 'rejected') =>
    (Object.keys(typeLabels) as (keyof DashboardSri['by_type'])[])
        .filter(type => sri.by_type[type][key] > 0)
        .map(type => {
            const count = sri.by_type[type][key];
            return `${count} ${typeLabels[type][count === 1 ? 0 : 1]}`;
        })
        .join(' · ');

interface RowProps {
    tone: 'wait' | 'fail';
    count: number;
    title: string;
    detail: string;
    // Solo ventas tiene lista filtrable por estado
    href?: string;
}

const Row = ({ tone, count, title, detail, href }: RowProps) => (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 lg:px-6 py-3">
        <span className={`w-2 h-2 rounded-full shrink-0 ${tone === 'fail' ? 'bg-sri-fail' : 'bg-sri-wait'}`} aria-hidden="true" />
        <span className={`font-mono text-xl font-semibold tabular-nums ${tone === 'fail' ? 'text-sri-fail' : 'text-sri-wait'}`}>{count}</span>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink-1">{title}</p>
            <p className="text-xs text-ink-3">{detail}</p>
        </div>
        {href && (
            <Link href={href} className="group inline-flex items-center gap-1.5 text-sm font-medium text-brand-ink">
                Ver ventas
                <FaArrowRight className="text-xs transition-transform group-hover:translate-x-0.5" />
            </Link>
        )}
    </div>
);

// Recorrido de los comprobantes en el SRI: lo que espera autorización y lo que fue rechazado
export const SriStrip = ({ sri }: Props) => {
    if (sri.pending === 0 && sri.rejected === 0) {
        return (
            <div className="flex items-center gap-3 rounded-xl border border-line bg-surface px-5 lg:px-6 py-3 text-sm text-ink-2">
                <FaCircleCheck className="text-sri-ok shrink-0" aria-hidden="true" />
                Todos tus comprobantes electrónicos están autorizados por el SRI.
            </div>
        );
    }

    return (
        <section className="rounded-xl border border-line bg-surface">
            <p className="px-5 lg:px-6 pt-4 text-xs font-semibold uppercase tracking-wider text-ink-3">Comprobantes en el SRI</p>
            <div className="divide-y divide-line">
                {sri.rejected > 0 && (
                    <Row
                        tone="fail"
                        count={sri.rejected}
                        title={sri.rejected === 1 ? 'Rechazado: revísalo y vuelve a procesarlo' : 'Rechazados: revísalos y vuelve a procesarlos'}
                        detail={breakdown(sri, 'rejected')}
                        href={sri.by_type.orders.rejected > 0 ? ordersStateUrl(SRI_REJECTED_STATES) : undefined}
                    />
                )}
                {sri.pending > 0 && (
                    <Row
                        tone="wait"
                        count={sri.pending}
                        title="Sin autorizar todavía"
                        detail={`${breakdown(sri, 'pending')}${sri.oldest_pending_date ? ` · el más antiguo del ${formatDate(sri.oldest_pending_date)}` : ''}`}
                        href={sri.by_type.orders.pending > 0 ? ordersStateUrl(SRI_PENDING_STATES) : undefined}
                    />
                )}
            </div>
        </section>
    );
};
