import Link from "next/link";
import { FaArrowRight } from "react-icons/fa6";

interface Props {
    totalOverdue: number;
    partiesCount: number;
}

const currency = (value: number) =>
    value.toLocaleString("es-EC", { style: "currency", currency: "USD" });

export const OverdueCard = ({ totalOverdue, partiesCount }: Props) => {
    const hasOverdue = totalOverdue > 0;

    return (
        <Link
            href="/overdue"
            className="group rounded-xl border border-line bg-surface p-5 lg:p-6 flex flex-col gap-3 transition-colors hover:bg-surface-hover"
        >
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">Cartera vencida</p>
            <span className={`font-mono text-3xl font-semibold tracking-tight tabular-nums ${hasOverdue ? 'text-sri-fail' : 'text-ink-1'}`}>
                {currency(totalOverdue)}
            </span>
            <p className="text-sm text-ink-2">
                {hasOverdue
                    ? `${partiesCount} ${partiesCount === 1 ? 'cuenta vencida' : 'cuentas vencidas'} entre clientes y proveedores`
                    : 'Sin cuentas vencidas. Todo al día.'}
            </p>
            <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-brand-ink">
                Ver cartera
                <FaArrowRight className="text-xs transition-transform group-hover:translate-x-0.5" />
            </span>
        </Link>
    );
};
