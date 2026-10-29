"use client";

import Link from "next/link";
import { FaArrowDown, FaArrowUp, FaRightLeft } from "react-icons/fa6";
import { INTERNAL_TRANSACTION_TYPES, movementTransactionTypeLabels } from "@/constants";
import { Movement, MovementParty, MovementSourceType } from "@/types";
import { money } from "../../banks/shared/bankUi";
import { CategoryPicker } from "./CategoryPicker";
import { ReceiptButton } from "@/components/payment-receipt/ReceiptButton";

interface Props {
    movements: Movement[];
    isLoading: boolean;
    onUpdated: (movement: Movement) => void;
}

// YYYY-MM-DD → "miércoles 8 de octubre"
const dayLabel = (date: string) =>
    new Date(`${date.slice(0, 10)}T12:00:00Z`).toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });

const partyLabel = (type: MovementSourceType | null, party: MovementParty | null) => {
    if (!type || !party) return null;
    if (type === 'cash_register_session') return 'Caja';
    const atts = party.atts as { account_number?: string };
    const last = atts.account_number ? `•${atts.account_number.slice(-4)}` : '';
    const bank = 'bank' in party ? party.bank?.name : undefined;
    return [bank ?? 'Banco', last].filter(Boolean).join(' ');
};

const originLabel = (movement: Movement) => {
    const origin = movement.origin;
    if (!origin) return null;
    return {
        href: origin.type === 'order' ? `/orders/${origin.id}` : `/shops/${origin.id}`,
        label: `${origin.type === 'order' ? 'Venta' : 'Compra'} ${origin.number}`,
    };
};

// Agrupa por fecha conservando el orden (fecha desc) del backend
const groupByDay = (movements: Movement[]) => {
    const groups: { date: string; items: Movement[] }[] = [];
    movements.forEach(movement => {
        const date = movement.atts.date.slice(0, 10);
        const last = groups[groups.length - 1];
        if (last?.date === date) last.items.push(movement);
        else groups.push({ date, items: [movement] });
    });
    return groups;
};

export const MovementsLedger = ({ movements, isLoading, onUpdated }: Props) => {

    if (isLoading) {
        return <div className="rounded-xl border border-line bg-surface p-8 text-center text-sm text-ink-3">Cargando movimientos…</div>;
    }

    if (movements.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-line-strong bg-surface p-8 text-center">
                <p className="font-medium text-ink-1">No hay movimientos en este período</p>
                <p className="mt-1 text-sm text-ink-3">Los cobros, pagos y movimientos de tus cajas y bancos aparecerán aquí.</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-line bg-surface overflow-hidden">
            {groupByDay(movements).map(group => (
                <section key={group.date}>
                    <h3 className="px-4 lg:px-5 py-2 border-y border-line first:border-t-0 bg-surface-sunken text-xs font-medium text-ink-3 first-letter:uppercase">
                        {dayLabel(group.date)}
                    </h3>
                    <ul className="divide-y divide-line">
                        {group.items.map(movement => (
                            <MovementRow key={movement.id} movement={movement} onUpdated={onUpdated} />
                        ))}
                    </ul>
                </section>
            ))}
        </div>
    );
};

const MovementRow = ({ movement, onUpdated }: { movement: Movement; onUpdated: (movement: Movement) => void }) => {

    const { atts } = movement;
    const isInternal = INTERNAL_TRANSACTION_TYPES.includes(atts.transaction_type);
    const isIncome = atts.type === 'INGRESO';
    const transactionLabel = movementTransactionTypeLabels[atts.transaction_type] ?? atts.transaction_type;
    const origin = originLabel(movement);
    const from = partyLabel(movement.source_type, movement.source);
    const to = partyLabel(movement.destination_type, movement.destination);

    const icon = isInternal
        ? <FaRightLeft className="text-ink-3" />
        : isIncome ? <FaArrowDown className="text-sri-ok" /> : <FaArrowUp className="text-sri-fail" />;

    return (
        <li className="flex items-start gap-3 px-4 lg:px-5 py-3">
            <span aria-hidden="true" className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-surface-sunken text-xs">
                {icon}
            </span>

            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink-1 truncate">{atts.description || origin?.label || transactionLabel}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-3">
                    <CategoryPicker movement={movement} onUpdated={onUpdated} />
                    <span>{transactionLabel}</span>
                    {from && <span>· {to && isInternal ? `${from} → ${to}` : from}</span>}
                    {origin && (
                        <Link href={origin.href} className="text-primary hover:underline">· {origin.label}</Link>
                    )}
                    {atts.receipt_number && <span className="tabular-nums">· Comp. {atts.receipt_number}</span>}
                    <ReceiptButton movement={movement} onUpdated={onUpdated} />
                    {atts.status === 'PENDIENTE' && (
                        <span className="rounded-full bg-sri-wait-soft px-2 py-0.5 text-sri-wait">Pendiente</span>
                    )}
                </div>
            </div>

            <span className={`shrink-0 text-sm font-semibold tabular-nums ${isInternal ? 'text-ink-2' : isIncome ? 'text-sri-ok' : 'text-ink-1'}`}>
                {isInternal ? '' : isIncome ? '+' : '−'}{money(atts.amount)}
            </span>
        </li>
    );
};
