"use client";

import { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { Paginate, Title } from "@/components";
import { currentMonth, Direction, shiftMonth, useMovementsLedger } from "./hooks/useMovementsLedger";
import { SummaryStrip } from "./components/SummaryStrip";
import { CategoryBreakdown } from "./components/CategoryBreakdown";
import { MovementsLedger } from "./components/MovementsLedger";
import { RegisterMovementModal } from "./components/RegisterMovementModal";
import { money } from "../banks/shared/bankUi";

const directionOptions: { value: Direction; label: string }[] = [
    { value: 'all', label: 'Todo' },
    { value: 'in', label: 'Entradas' },
    { value: 'out', label: 'Salidas' },
];

// "2026-10" → "octubre 2026"
const monthName = (month: string) =>
    new Date(`${month}-15T12:00:00Z`).toLocaleDateString('es-EC', { month: 'long', year: 'numeric', timeZone: 'UTC' });

const PageMovements = () => {

    const {
        month, setMonth, direction, setDirection, bankAccountId, setBankAccountId,
        movements, meta, links, summary, isLoading, fetchMovements, fetchSummary, replaceMovement,
    } = useMovementsLedger();
    const [isRegistering, setIsRegistering] = useState(false);

    const handleSaved = () => {
        setIsRegistering(false);
        fetchMovements();
        fetchSummary();
    };

    const isCurrentMonth = month === currentMonth();
    const bankAccounts = summary?.accounts.filter(it => it.type === 'bank_account') ?? [];
    const label = monthName(month);

    const handlePageChange = (e: React.MouseEvent<HTMLButtonElement>, pageUrl: string) => {
        e.preventDefault();
        const match = pageUrl.match(/[?&]page=(\d+)/);
        fetchMovements(match ? Number(match[1]) : 1);
    };

    return (
        <div className="dark:text-gray-300">
            <Title
                title="Movimientos"
                subTitle="Todo el dinero que entra y sale de tu negocio"
                actions={[{ label: "Registrar movimiento", type: "button", action: "add", onClick: () => setIsRegistering(true) }]}
            />

            <div className="md:mx-8 py-4 mt-4 flex flex-col gap-4">
                {/* Filtros: mes, cuenta y dirección */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center rounded-lg border border-line-strong bg-surface">
                        <button type="button" onClick={() => setMonth(shiftMonth(month, -1))} aria-label="Mes anterior" className="p-2.5 text-ink-3 hover:text-ink-1">
                            <FaChevronLeft className="text-xs" />
                        </button>
                        <span className="min-w-32 text-center text-sm font-medium text-ink-1 first-letter:uppercase" aria-live="polite">{label}</span>
                        <button type="button" onClick={() => setMonth(shiftMonth(month, 1))} disabled={isCurrentMonth} aria-label="Mes siguiente" className="p-2.5 text-ink-3 hover:text-ink-1 disabled:opacity-30 disabled:cursor-not-allowed">
                            <FaChevronRight className="text-xs" />
                        </button>
                    </div>

                    {bankAccounts.length > 0 && (
                        <select
                            aria-label="Cuenta"
                            value={bankAccountId}
                            onChange={(e) => setBankAccountId(e.target.value ? Number(e.target.value) : '')}
                            className="rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink-1 focus:outline-none focus:border-primary"
                        >
                            <option value="">Todas las cuentas y cajas</option>
                            {bankAccounts.map(account => (
                                <option key={account.id} value={account.id}>{account.name}</option>
                            ))}
                        </select>
                    )}

                    <div role="radiogroup" aria-label="Dirección" className="flex rounded-lg border border-line-strong bg-surface p-0.5 sm:ml-auto">
                        {directionOptions.map(option => (
                            <button
                                key={option.value}
                                type="button"
                                role="radio"
                                aria-checked={direction === option.value}
                                onClick={() => setDirection(option.value)}
                                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${direction === option.value ? 'bg-brand-soft text-brand-ink font-medium' : 'text-ink-3 hover:text-ink-1'}`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                <SummaryStrip summary={summary} monthLabel={label} />

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem] items-start">
                    <div className="min-w-0">
                        <MovementsLedger movements={movements} isLoading={isLoading} onUpdated={replaceMovement} />
                        <Paginate meta={meta} links={links} reqNewPage={handlePageChange} />
                    </div>

                    {summary && (
                        <aside className="flex flex-col gap-4 xl:sticky xl:top-20">
                            <CategoryBreakdown summary={summary} />

                            {summary.accounts.length > 0 && (
                                <section className="rounded-xl border border-line bg-surface p-4 lg:p-5">
                                    <h2 className="text-sm font-semibold text-ink-1">Dónde está tu dinero hoy</h2>
                                    <ul className="mt-3 space-y-2 text-sm">
                                        {summary.accounts.map(account => (
                                            <li key={`${account.type}-${account.id}`} className="flex items-baseline justify-between gap-3">
                                                <span className="truncate text-ink-2">{account.name}</span>
                                                <span className={`tabular-nums font-medium ${account.balance < 0 ? 'text-sri-fail' : 'text-ink-1'}`}>{money(account.balance)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <p className="mt-3 pt-3 border-t border-line flex items-baseline justify-between text-sm">
                                        <span className="text-ink-2">Total</span>
                                        <span className="tabular-nums font-semibold text-ink-1">
                                            {money(summary.accounts.reduce((sum, account) => sum + account.balance, 0))}
                                        </span>
                                    </p>
                                </section>
                            )}
                        </aside>
                    )}
                </div>
            </div>

            {isRegistering && <RegisterMovementModal onClose={() => setIsRegistering(false)} onSaved={handleSaved} />}
        </div>
    );
};

export default PageMovements;
