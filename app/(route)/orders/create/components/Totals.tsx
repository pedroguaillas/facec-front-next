"use client";

import { useCreateInvoice } from "../../context/InvoiceCreateContext";
import { TableResponsive } from "@/components";
import { ButtonSubmit } from "./ButtonSubmit";

export const Totals = () => {
    const { invoice, selectCustom, setInvoice, formErrors } = useCreateInvoice();

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
                        <th className="border border-gray-300">Resultados</th>
                        <th className="border border-gray-300 w-32">Monto</th>
                    </tr>
                </thead>
                <tbody className="[&>tr>td]:p-2">
                    {invoice.sub_total === 0 && (
                        <tr>
                            <td className="border border-gray-300">Subtotal</td>
                            <td className="text-right border border-gray-300">{invoice.sub_total.toFixed(2)}</td>
                        </tr>
                    )}
                    {subtotalRows.map(({ label, value }) => (
                        <tr key={label}>
                            <td className="border border-gray-300">{label}</td>
                            <td className="text-right border border-gray-300">{value.toFixed(2)}</td>
                        </tr>
                    ))}

                    <tr>
                        <td className="border border-gray-300">Descuento</td>
                        <td className="text-right border border-gray-300">
                            <input
                                type="number"
                                value={invoice.discount}
                                onChange={handleDiscountChange}
                                min={0}
                                max={invoice.sub_total}
                                className={`w-16 border rounded px-1 ${formErrors.discount ? 'border-red-500' : 'border-gray-300'}`}
                            />
                        </td>
                    </tr>

                    {ivaRows.map(({ label, value }) => (
                        <tr key={label}>
                            <td className="border border-gray-300">{label}</td>
                            <td className="text-right border border-gray-300">{value.toFixed(2)}</td>
                        </tr>
                    ))}

                    {invoice.no_iva > 0 && (
                        <tr>
                            <td className="border border-gray-300">No objeto de IVA</td>
                            <td className="text-right border border-gray-300">{invoice.no_iva.toFixed(2)}</td>
                        </tr>
                    )}
                </tbody>
                <tfoot>
                    <tr>
                        <th className="border border-gray-300">TOTAL</th>
                        <th className="text-right p-2 border border-gray-300">{invoice.total.toFixed(2)}</th>
                    </tr>
                </tfoot>
            </TableResponsive>
            {selectCustom?.atts.identication === '9999999999999' && invoice.total > 50 && <p className="text-sm text-red-500 text-right pt-2">Límite $50 si es Consumidor Final</p>}
            <ButtonSubmit />
        </div>
    );
};
