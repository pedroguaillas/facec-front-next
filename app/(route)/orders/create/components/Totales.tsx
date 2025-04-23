"use client";

import { TableResponsive } from "@/components";
import { useCreateInvoice } from "../../context/InvoiceCreateContext";
import { ButtonSubmit } from "./ButtonSubmit";

export const Totales = () => {

    const { invoice, setInvoice, formErrors } = useCreateInvoice();

    const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value)) {
            setInvoice((prev) => ({
                ...prev,
                discount: value,
                total: prev.sub_total + Number(prev.ice) + prev.iva5 + prev.iva8 + prev.iva + prev.iva15 - Number(value)
            }));
        }
    };

    return (
        <div className="full">
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
                    {invoice.base0 > 0 && (
                        <tr>
                            <td className="border border-gray-300">Subtotal 0%</td>
                            <td className="text-right border border-gray-300">{invoice.base0.toFixed(2)}</td>
                        </tr>
                    )}
                    {invoice.base12 > 0 && (
                        <tr>
                            <td className="border border-gray-300">Subtotal 12%</td>
                            <td className="text-right border border-gray-300">{invoice.base12.toFixed(2)}</td>
                        </tr>
                    )}
                    {invoice.base15 > 0 && (
                        <tr>
                            <td className="border border-gray-300">Subtotal 15%</td>
                            <td className="text-right border border-gray-300">{invoice.base15.toFixed(2)}</td>
                        </tr>
                    )}
                    <tr>
                        <td className="border border-gray-300">Descuento</td>
                        <td className="text-right border border-gray-300">
                            <input
                                type="number"
                                value={invoice.discount}
                                onChange={handleDiscountChange}
                                min={0}
                                max={invoice.sub_total}
                                className={`w-16 border rounded px-1
                                ${formErrors.discount ? 'border-red-500' : 'border-gray-300'}`}
                            />
                        </td>
                    </tr>
                    {invoice.base12 > 0 && (
                        <tr>
                            <td className="border border-gray-300">IVA 12%</td>
                            <td className="text-right border border-gray-300">{(invoice.base12 * .12).toFixed(2)}</td>
                        </tr>
                    )}
                    {invoice.base15 > 0 && (
                        <tr>
                            <td className="border border-gray-300">IVA 15%</td>
                            <td className="text-right border border-gray-300">{(invoice.base15 * .15).toFixed(2)}</td>
                        </tr>
                    )}
                    {invoice.no_iva > 0 && (
                        <tr>
                            <td className="border border-gray-300">No objeto de IVA</td>
                            <td className="text-right border border-gray-300">{invoice.no_iva.toFixed(2)}</td>
                        </tr>
                    )}
                </tbody>
                <thead>
                    <tr>
                        <th className="border border-gray-300">TOTAL</th>
                        <th className="text-right p-2 border border-gray-300">{invoice.total.toFixed(2)}</th>
                    </tr>
                </thead>
            </TableResponsive>
            <ButtonSubmit />
        </div>
    )
}
