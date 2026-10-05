import Link from "next/link";
import { FaTriangleExclamation } from "react-icons/fa6";

interface Props {
    totalOverdue: number;
    partiesCount: number;
}

export const OverdueCard = ({ totalOverdue, partiesCount }: Props) => (
    <Link
        href="/overdue"
        className="rounded-xl border p-5 flex flex-col gap-4 transition-colors hover:bg-[var(--surface-hover)]"
        style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
            borderLeft: '3px solid var(--color-danger)',
        }}
    >
        <div className="flex items-center justify-between">
            <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
                style={{ background: 'rgba(221, 31, 18, 0.12)', color: 'var(--color-danger)' }}
            >
                <FaTriangleExclamation />
            </div>
            {partiesCount > 0 && (
                <span
                    className="text-xs font-semibold rounded-full px-2 py-1"
                    style={{ background: 'rgba(221, 31, 18, 0.12)', color: 'var(--color-danger)' }}
                >
                    {partiesCount} {partiesCount === 1 ? 'cuenta' : 'cuentas'}
                </span>
            )}
        </div>
        <div>
            <h2 className="text-3xl font-bold tracking-tight tabular-nums" style={{ color: 'var(--foreground)' }}>
                ${totalOverdue.toFixed(2)}
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
                Cartera vencida
            </p>
        </div>
    </Link>
);
