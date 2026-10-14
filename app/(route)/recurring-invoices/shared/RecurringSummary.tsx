"use client";

import { ReactNode } from "react";
import { useFormInvoice } from "../../orders/context/FormInvoiceContext";
import { recurringFrequencyLabels } from "@/constants";
import { shortDateTime } from "@/helpers/recurrenceHelper";
import { RecurringFrequency } from "@/types";

interface Props {
    frequency: RecurringFrequency;
    upcoming: string[];
    autoSend: boolean;
    footer: ReactNode;
}

const money = (value: number) => `$${value.toFixed(2)}`;

// Recibo de la plantilla: cuánto sale cada factura y cuándo salen las próximas
export const RecurringSummary = ({ frequency, upcoming, autoSend, footer }: Props) => {

    const { invoice } = useFormInvoice();
    const tax = invoice.iva5 + invoice.iva8 + invoice.iva + invoice.iva15;

    return (
        <div className="rounded-xl border border-line bg-surface">
            <div className="p-4 lg:p-5">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-3">Cada factura</h2>

                <dl className="mt-3 space-y-1.5 text-sm">
                    <div className="flex justify-between gap-4">
                        <dt className="text-ink-2">Subtotal</dt>
                        <dd className="tabular-nums text-ink-1">{money(invoice.sub_total)}</dd>
                    </div>
                    {tax > 0 && (
                        <div className="flex justify-between gap-4">
                            <dt className="text-ink-2">IVA</dt>
                            <dd className="tabular-nums text-ink-1">{money(tax)}</dd>
                        </div>
                    )}
                </dl>

                <div className="mt-3 pt-3 border-t border-dashed border-line-strong flex items-baseline justify-between">
                    <span className="text-sm font-semibold text-ink-1">{recurringFrequencyLabels[frequency]}</span>
                    <span className="text-2xl font-semibold tracking-tight tabular-nums text-ink-1">{money(invoice.total)}</span>
                </div>

                {/* Calendario: las próximas fechas en que el sistema emite solo */}
                <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide text-ink-3">Próximas emisiones</h3>
                {upcoming.length === 0 ? (
                    <p className="mt-2 text-sm text-ink-3">No quedan fechas con esta programación.</p>
                ) : (
                    <ol className="mt-2 relative border-l border-line-strong ml-1.5 space-y-2.5">
                        {upcoming.map((date, index) => (
                            <li key={date} className="pl-4 relative text-sm">
                                <span
                                    aria-hidden="true"
                                    className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 ${index === 0 ? 'border-brand-ink bg-brand-ink' : 'border-line-strong bg-surface'}`}
                                />
                                <span className={`tabular-nums ${index === 0 ? 'font-medium text-ink-1' : 'text-ink-2'}`}>{shortDateTime(date)}</span>
                                {index === 0 && <span className="ml-2 text-xs text-ink-3">primera</span>}
                            </li>
                        ))}
                    </ol>
                )}

                <ul className="mt-4 space-y-1 text-xs text-ink-3">
                    <li>No se emiten fechas pasadas: arranca desde hoy.</li>
                    <li>{autoSend ? 'Se autoriza en el SRI y se envía al cliente.' : 'Queda en Ventas sin procesar, para que la revises.'}</li>
                    <li>Si una emisión falla, se reintenta sola cada hora.</li>
                </ul>
            </div>

            <div className="border-t border-line bg-surface-sunken p-4 rounded-b-xl">
                {footer}
            </div>
        </div>
    );
};
