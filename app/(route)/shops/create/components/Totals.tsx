"use client";

import { TableResponsive } from "@/components"
import { useCreateShop } from "../context/ShopCreateContext";
import { ChangeEvent } from "react";
import { SubmitButton } from "./SubmitButton";

export const Totals = () => {

    const { shop, setShop, errorShop } = useCreateShop();

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        // if (isNaN(value)) return;

        const form = { ...shop, [name]: value };
        form.iva = Number((Number(form.base12) * 0.12).toFixed(2));
        form.iva5 = Number((Number(form.base5) * 0.05).toFixed(2));
        form.iva15 = Number((Number(form.base15) * 0.15).toFixed(2));
        form.sub_total =
            Number(form.no_iva) + Number(form.base0) + Number(form.base5) + Number(form.base12) + Number(form.base15);
        form.total = Number(form.base0) + Number(form.base5) + Number(form.base12) + Number(form.base15) + Number(form.iva) + Number(form.iva5) + Number(form.iva15);
        setShop(form);
    };

    const subtotalRows = [
        { name: 'base0', label: 'Subtotal 0%', value: shop.base0 },
        { name: 'base5', label: 'Subtotal 5%', value: shop.base5 },
        { name: 'base12', label: 'Subtotal 12%', value: shop.base12 },
        { name: 'base15', label: 'Subtotal 15%', value: shop.base15 },
    ];

    const ivaRows = [
        { label: 'IVA 5%', value: shop.base5 * 0.05 },
        { label: 'IVA 12%', value: shop.base12 * 0.12 },
        { label: 'IVA 15%', value: shop.base15 * 0.15 },
    ];

    return (
        <div className="flex flex-col items-end justify-end">
            <div className="w-72">
                <TableResponsive>
                    <thead>
                        <tr className="[&>th]:p-2">
                            <th className="border border-gray-300 w-50">Resultados</th>
                            <th className="border border-gray-300 w-32">Monto</th>
                        </tr>
                    </thead>
                    <tbody className="[&>tr>td]:p-2">
                        {subtotalRows.map(({ name, label, value }) => (
                            <tr key={label}>
                                <td className="border border-gray-300 text-left">{label}</td>
                                <td className="text-right border border-gray-300">
                                    <input
                                        type="number"
                                        value={value}
                                        name={name}
                                        onChange={handleChange}
                                        min={0}
                                        className={`w-16 border rounded px-1 ${errorShop.no_iva ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                </td>
                            </tr>
                        ))}
                        {ivaRows.map(({ label, value }) => (
                            <tr key={label}>
                                <td className="border border-gray-300 text-left">{label}</td>
                                <td className="text-right border border-gray-300">{value.toFixed(2)}</td>
                            </tr>
                        ))}
                        <tr>
                            <td className="border border-gray-300 text-left">No objeto de IVA ($)</td>
                            <td className="text-right border border-gray-300">
                                <input
                                    type="number"
                                    value={shop.no_iva}
                                    name="no_iva"
                                    onChange={handleChange}
                                    min={0}
                                    className={`w-16 border rounded px-1 ${errorShop.no_iva ? 'border-red-500' : 'border-gray-300'}`}
                                />
                            </td>
                        </tr>

                        <tr>
                            <td className="border border-gray-300 text-left">Monto ICE</td>
                            <td className="text-right border border-gray-300">{shop.ice.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td className="border border-gray-300 text-left">Descuento</td>
                            <td className="text-right border border-gray-300">{shop.discount.toFixed(2)}</td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <th className="border border-gray-300">TOTAL</th>
                            <th className="text-right p-2 border border-gray-300">{shop.total.toFixed(2)}</th>
                        </tr>
                    </tfoot>
                </TableResponsive>
            </div>
            <SubmitButton />
        </div>
    )
}
