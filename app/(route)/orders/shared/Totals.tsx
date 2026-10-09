"use client";

import { ButtonSubmit } from "./ButtonSubmit";
import { useFormInvoice } from "../context/FormInvoiceContext";
import { CONSUMIDOR_FINAL_IDENTICATION } from "@/constants";

const money = (value: number | string) => Number(value).toFixed(2);

// Panel "recibo": desglose del comprobante, total y acciones
export const Totals = () => {
    const { invoice, selectCustom } = useFormInvoice();

    const rows = [
        { label: 'Subtotal 0%', value: invoice.base0 },
        { label: 'Subtotal 5%', value: invoice.base5 },
        { label: 'Subtotal 8%', value: invoice.base8 },
        { label: 'Subtotal 12%', value: invoice.base12 },
        { label: 'Subtotal 15%', value: invoice.base15 },
        { label: 'No objeto de IVA', value: invoice.no_iva },
        { label: 'Descuento', value: Number(invoice.discount) },
        { label: 'ICE', value: invoice.ice },
        { label: 'IVA 5%', value: invoice.iva5 },
        { label: 'IVA 8%', value: invoice.iva8 },
        { label: 'IVA 12%', value: invoice.iva },
        { label: 'IVA 15%', value: invoice.iva15 },
    ].filter(row => Number(row.value) > 0);

    const overFinalConsumerLimit = selectCustom?.atts.identication === CONSUMIDOR_FINAL_IDENTICATION && invoice.total > 50;

    return (
        <div className="rounded-xl border border-line bg-surface">
            <div className="p-4 lg:p-5">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-3">Resumen</h2>

                <dl className="mt-3 space-y-1.5 text-sm">
                    {rows.length === 0 && (
                        <div className="flex justify-between">
                            <dt className="text-ink-3">Subtotal</dt>
                            <dd className="tabular-nums text-ink-3">0.00</dd>
                        </div>
                    )}
                    {rows.map(({ label, value }) => (
                        <div key={label} className="flex justify-between gap-4">
                            <dt className="text-ink-2">{label}</dt>
                            <dd className="tabular-nums text-ink-1">{money(value)}</dd>
                        </div>
                    ))}
                </dl>

                <div className="mt-3 pt-3 border-t border-dashed border-line-strong flex items-baseline justify-between">
                    <span className="text-sm font-semibold text-ink-1">Total</span>
                    <span className="text-2xl font-semibold tracking-tight tabular-nums text-ink-1">${money(invoice.total)}</span>
                </div>

                {overFinalConsumerLimit && (
                    <p className="mt-3 rounded-lg bg-sri-fail-soft px-3 py-2 text-xs font-medium text-sri-fail" role="alert">
                        Consumidor Final admite hasta $50. Selecciona un cliente identificado.
                    </p>
                )}
            </div>

            <div className="border-t border-line bg-surface-sunken p-4 rounded-b-xl">
                <ButtonSubmit />
            </div>
        </div>
    );
};
