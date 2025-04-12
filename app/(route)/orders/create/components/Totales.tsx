"use client";

import { TableResponsive } from "@/components";
import { useCreateInvoice } from "../../context/InvoiceCreateContext";

export const Totales = () => {

    const { invoice } = useCreateInvoice();

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
                    <tr>
                        <td className="border border-gray-300">Subtotal 0%</td>
                        <td className="text-right border border-gray-300">{invoice.base0.toFixed(2)}</td>
                    </tr>
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
                        <td className="text-right border border-gray-300">{invoice.discount.toFixed(2)}</td>
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
                    <tr>
                        <td className="border border-gray-300">No objeto de IVA</td>
                        <td className="text-right border border-gray-300">{invoice.no_iva.toFixed(2)}</td>
                    </tr>
                </tbody>
                <thead>
                    <tr>
                        <th className="border border-gray-300">TOTAL</th>
                        <th className="text-right p-2 border border-gray-300">{invoice.total.toFixed(2)}</th>
                    </tr>
                </thead>
            </TableResponsive>
        </div>
    )
}
