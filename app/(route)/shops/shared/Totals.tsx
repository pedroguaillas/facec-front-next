"use client";

import { ChangeEvent } from "react";
import { useParams } from "next/navigation";
import { useFormShop } from "../context/FormShopContext";
import { useShopVoucherType } from "../hooks/useShopVoucherType";
import { SubmitButton } from "./SubmitButton";

const money = (value: number | string) => Number(value || 0).toFixed(2);

// Recibo de la compra: bases (editables salvo en liquidación), IVA calculado, total y lo que queda por pagar
export const Totals = () => {

    const { shop, taxes, applieWithholding, xmlImported, setShop, errorShop, setErrorShop } = useFormShop();
    const { isLiquidacion, isNotaVenta } = useShopVoucherType();
    const params = useParams();
    // Con la retención autorizada la compra ya no se puede modificar
    const isLocked = !!params?.id && shop.state_retencion === 'AUTORIZADO';

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        const parsed = Number(value);
        if (parsed < 0) return;

        // Número o '' (para poder borrar el campo)
        const newValue = value !== '' ? parsed : value;

        const form = { ...shop, [name]: newValue };
        form.iva = Number((Number(form.base12) * 0.12).toFixed(2));
        form.iva5 = Number((Number(form.base5) * 0.05).toFixed(2));
        form.iva15 = Number((Number(form.base15) * 0.15).toFixed(2));
        form.sub_total = Number(form.no_iva) + Number(form.base0) + Number(form.base5) + Number(form.base12) + Number(form.base15);
        // El total incluye lo no objeto de IVA y el ICE (igual que el importeTotal del XML)
        form.total = Number((form.sub_total + Number(form.ice) + form.iva + form.iva5 + form.iva15).toFixed(2));

        setShop(form);
        setErrorShop((prev) => ({ ...prev, [name]: '' }));
    };

    // Nota de Venta no maneja IVA (por eso tampoco admite retención de IVA): solo subtotal 0%
    const baseRows = [
        { name: 'base15', label: 'Subtotal 15%', value: shop.base15, error: errorShop.base15, hidden: isNotaVenta },
        { name: 'base5', label: 'Subtotal 5%', value: shop.base5, error: errorShop.base5, hidden: isNotaVenta },
        { name: 'base0', label: 'Subtotal 0%', value: shop.base0, error: errorShop.base0, hidden: false },
        { name: 'no_iva', label: 'No objeto de IVA', value: shop.no_iva, error: errorShop.no_iva, hidden: isNotaVenta },
    ].filter(row => !row.hidden);

    const ivaRows = [
        { label: 'IVA 15%', value: Number(shop.base15) * 0.15 },
        { label: 'IVA 5%', value: Number(shop.base5) * 0.05 },
    ].filter(row => !isNotaVenta && row.value > 0);

    const retained = applieWithholding ? taxes.reduce((acc, tax) => acc + (Number(tax.value) || 0), 0) : 0;

    return (
        <div className="rounded-xl border border-line bg-surface">
            <div className="p-4 lg:p-5">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-3">Resumen</h2>
                {!isLiquidacion && (
                    <p className="mt-1 text-xs text-ink-3">{xmlImported ? 'Bases cargadas del XML.' : 'Copia las bases tal como están en el comprobante.'}</p>
                )}

                <dl className="mt-3 space-y-1.5 text-sm">
                    {baseRows.map(({ name, label, value, error }) => (
                        <div key={name} className="flex items-center justify-between gap-4">
                            <dt className="text-ink-2"><label htmlFor={`shop-${name}`}>{label}</label></dt>
                            <dd>
                                {isLiquidacion || xmlImported ? (
                                    <span className="tabular-nums text-ink-1">{money(value)}</span>
                                ) : (
                                    <input
                                        id={`shop-${name}`}
                                        type="text"
                                        inputMode="decimal"
                                        value={value}
                                        name={name}
                                        onChange={handleChange}
                                        onFocus={e => e.target.select()}
                                        min={0}
                                        aria-invalid={error ? 'true' : 'false'}
                                        className={`w-28 rounded-md border px-2 py-1 text-right text-sm tabular-nums bg-[var(--background)] text-ink-1 focus:outline-none focus:border-primary ${error ? 'border-red-400' : 'border-line-strong'}`}
                                    />
                                )}
                            </dd>
                        </div>
                    ))}
                    {ivaRows.map(({ label, value }) => (
                        <div key={label} className="flex justify-between gap-4">
                            <dt className="text-ink-2">{label}</dt>
                            <dd className="tabular-nums text-ink-1">{money(value)}</dd>
                        </div>
                    ))}
                    {Number(shop.ice) > 0 && (
                        <div className="flex justify-between gap-4">
                            <dt className="text-ink-2">ICE</dt>
                            <dd className="tabular-nums text-ink-1">{money(shop.ice)}</dd>
                        </div>
                    )}
                    {Number(shop.discount) > 0 && (
                        <div className="flex justify-between gap-4">
                            <dt className="text-ink-2">Descuento</dt>
                            <dd className="tabular-nums text-ink-1">{money(shop.discount)}</dd>
                        </div>
                    )}
                </dl>

                <div className="mt-3 pt-3 border-t border-dashed border-line-strong flex items-baseline justify-between">
                    <span className="text-sm font-semibold text-ink-1">Total</span>
                    <span className={`tabular-nums text-ink-1 ${retained > 0 ? 'text-lg font-medium' : 'text-2xl font-semibold tracking-tight'}`}>${money(shop.total)}</span>
                </div>

                {/* Con retención: lo que realmente sale de caja/banco */}
                {retained > 0 && (
                    <>
                        <div className="mt-1 flex justify-between text-sm">
                            <span className="text-ink-2">Retenido</span>
                            <span className="tabular-nums text-ink-2">−{money(retained)}</span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-line flex items-baseline justify-between">
                            <span className="text-sm font-semibold text-ink-1">A pagar</span>
                            <span className="text-2xl font-semibold tracking-tight tabular-nums text-ink-1">${money(Number(shop.total) - retained)}</span>
                        </div>
                    </>
                )}
            </div>

            {isLocked ? (
                <p className="border-t border-line bg-surface-sunken p-4 rounded-b-xl text-xs text-ink-3">La retención ya está autorizada: esta compra no se puede modificar.</p>
            ) : (
                <div className="border-t border-line bg-surface-sunken p-4 rounded-b-xl">
                    <SubmitButton />
                </div>
            )}
        </div>
    )
}
