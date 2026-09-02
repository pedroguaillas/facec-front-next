"use client";

import { TableResponsive } from "@/components";
import { ButtonSubmit } from "./ButtonSubmit";
import { useFormInvoice } from "../context/FormInvoiceContext";
import { CONSUMIDOR_FINAL_IDENTICATION } from "@/constants";

const inputBase = "w-full border rounded-md px-2 py-1.5 text-sm text-right bg-[var(--background)] dark:text-gray-300 focus:outline-none focus:border-primary transition-colors";

export const Totals = () => {
    const { invoice, selectCustom, setInvoice, formErrors } = useFormInvoice();

    const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        if (value === '') {
            setInvoice(prev => ({
                ...prev,
                discount: '',
                total: Number((prev.sub_total + prev.ice + prev.iva5 + prev.iva8 + prev.iva + prev.iva15).toFixed(2)),
            }));
            return;
        }

        const parsed = Number(value);
        if (isNaN(parsed) || parsed < 0 || parsed >= invoice.sub_total) return;

        const total = Number((invoice.sub_total + invoice.ice + invoice.iva5 + invoice.iva8 + invoice.iva + invoice.iva15 - parsed).toFixed(2));

        setInvoice(prev => ({
            ...prev,
            discount: value,
            total,
        }));
    };

    const subtotalRows = [
        { label: 'Subtotal 0%', value: invoice.base0 },
        { label: 'Subtotal 5%', value: invoice.base5 },
        { label: 'Subtotal 8%', value: invoice.base8 },
        { label: 'Subtotal 12%', value: invoice.base12 },
        { label: 'Subtotal 15%', value: invoice.base15 },
    ].filter(item => item.value > 0);

    const ivaRows = [
        { label: 'IVA 5%', value: invoice.base5 * 0.05 },
        { label: 'IVA 8%', value: invoice.base12 * 0.08 },
        { label: 'IVA 12%', value: invoice.base12 * 0.12 },
        { label: 'IVA 15%', value: invoice.base15 * 0.15 },
    ].filter(item => item.value > 0);

    return (
        <div className="flex flex-col">
            <TableResponsive>
                <thead>
                    <tr className="[&>th]:p-2">
                        <th className="border border-[var(--border)]">Resultados</th>
                        <th className="border border-[var(--border)] w-32">Monto</th>
                    </tr>
                </thead>
                <tbody className="[&>tr>td]:p-2">
                    {invoice.sub_total === 0 && (
                        <tr>
                            <td className="border border-[var(--border)]">Subtotal</td>
                            <td className="text-right border border-[var(--border)]">{invoice.sub_total.toFixed(2)}</td>
                        </tr>
                    )}
                    {subtotalRows.map(({ label, value }) => (
                        <tr key={label}>
                            <td className="border border-[var(--border)]">{label}</td>
                            <td className="text-right border border-[var(--border)]">{value.toFixed(2)}</td>
                        </tr>
                    ))}
                    <tr>
                        <td className="border border-[var(--border)]">Descuento</td>
                        <td className="text-right border border-[var(--border)]">
                            <input
                                type="number"
                                value={invoice.discount}
                                onChange={handleDiscountChange}
                                min={0}
                                max={invoice.sub_total}
                                className={`${inputBase} w-20 ${formErrors.discount ? 'border-red-400' : 'border-[var(--border-strong)]'}`}
                            />
                        </td>
                    </tr>
                    {invoice.ice > 0 && (
                        <tr>
                            <td className="border border-[var(--border)]">Monto de ICE</td>
                            <td className="text-right border border-[var(--border)]">{invoice.ice.toFixed(2)}</td>
                        </tr>
                    )}
                    {ivaRows.map(({ label, value }) => (
                        <tr key={label}>
                            <td className="border border-[var(--border)]">{label}</td>
                            <td className="text-right border border-[var(--border)]">{value.toFixed(2)}</td>
                        </tr>
                    ))}
                    {invoice.no_iva > 0 && (
                        <tr>
                            <td className="border border-[var(--border)]">No objeto de IVA</td>
                            <td className="text-right border border-[var(--border)]">{invoice.no_iva.toFixed(2)}</td>
                        </tr>
                    )}
                </tbody>
                <tfoot>
                    <tr>
                        <th className="border border-[var(--border)]">TOTAL</th>
                        <th className="text-right p-2 border border-[var(--border)]">{invoice.total.toFixed(2)}</th>
                    </tr>
                </tfoot>
            </TableResponsive>
            {selectCustom?.atts.identication === CONSUMIDOR_FINAL_IDENTICATION && invoice.total > 50 && <p className="text-sm text-red-500 text-right pt-2">Límite $50 si es Consumidor Final</p>}
            <ButtonSubmit />
        </div>
    );
};
