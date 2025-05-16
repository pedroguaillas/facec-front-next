"use client";

import { useFormShop } from "../context/FormShopContext";
import { TableResponsive } from "@/components"
import { SubmitButton } from "./SubmitButton";
import { VoucherType } from "@/constants";
import { ChangeEvent } from "react";

export const Totals = () => {

    const { shop, setShop, errorShop, setErrorShop } = useFormShop();

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        // Convertir a número
        const parsed = Number(value);

        // Si es menor a 0, no actualizar
        if (parsed < 0) return;

        // pasar un número o ''
        const newValue = value !== '' ? parsed : value;

        const form = { ...shop, [name]: newValue };
        form.iva = Number((Number(form.base12) * 0.12).toFixed(2));
        form.iva5 = Number((Number(form.base5) * 0.05).toFixed(2));
        form.iva15 = Number((Number(form.base15) * 0.15).toFixed(2));
        form.sub_total = Number(form.no_iva) + Number(form.base0) + Number(form.base5) + Number(form.base12) + Number(form.base15);
        form.total = Number(form.base0) + Number(form.base5) + Number(form.base12) + Number(form.base15) + Number(form.iva) + Number(form.iva5) + Number(form.iva15);

        setShop(form);
        setErrorShop((prev) => ({ ...prev, [name]: '' }));
    };

    const subtotalRows = [
        { name: 'base0', label: 'Subtotal 0%', value: shop.base0, error: errorShop.base0 },
        { name: 'base5', label: 'Subtotal 5%', value: shop.base5, error: errorShop.base5 },
        { name: 'base12', label: 'Subtotal 12%', value: shop.base12, error: errorShop.base12 },
        { name: 'base15', label: 'Subtotal 15%', value: shop.base15, error: errorShop.base15 },
    ];

    const ivaRows = [
        { label: 'IVA 5%', value: shop.base5 * 0.05 },
        { label: 'IVA 12%', value: shop.base12 * 0.12 },
        { label: 'IVA 15%', value: shop.base15 * 0.15 },
    ];

    return (
        <div className="flex flex-col gap-2 items-end justify-end">
            <div className="w-72">
                <TableResponsive>
                    <thead>
                        <tr className="[&>th]:p-2">
                            <th className="border border-gray-300 w-50">Resultados</th>
                            <th className="border border-gray-300 w-32">Monto</th>
                        </tr>
                    </thead>
                    <tbody className="[&>tr>td]:p-2">
                        {subtotalRows.map(({ name, label, value, error }) => (
                            <tr key={label}>
                                <td className="border border-gray-300 text-left">{label}</td>
                                {Number(shop.voucher_type) === VoucherType.LIQUIDATION &&
                                    <td className="text-right border border-gray-300">{value.toFixed(2)}</td>}
                                {Number(shop.voucher_type) !== VoucherType.LIQUIDATION && (
                                    <td className="text-right border border-gray-300">
                                        <input
                                            type="number"
                                            value={value}
                                            name={name}
                                            onChange={handleChange}
                                            min={0}
                                            className={`w-full border rounded px-1 ${error ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                    </td>
                                )}
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
                            {Number(shop.voucher_type) === VoucherType.LIQUIDATION &&
                                <td className="text-right border border-gray-300">{shop.no_iva.toFixed(2)}</td>}
                            {Number(shop.voucher_type) !== VoucherType.LIQUIDATION && (
                                <td className="text-right border border-gray-300">
                                    <input
                                        type="number"
                                        value={shop.no_iva}
                                        name="no_iva"
                                        onChange={handleChange}
                                        min={0}
                                        className={`w-full border rounded px-1 ${errorShop.no_iva ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                </td>
                            )}
                        </tr>
                        {shop.ice > 0 && (
                            <tr>
                                <td className="border border-gray-300 text-left">Monto ICE</td>
                                <td className="text-right border border-gray-300">{shop.ice}</td>
                            </tr>
                        )}
                        {/* TODO: Verficar to.Fixed(2) en descuento y total */}
                        <tr>
                            <td className="border border-gray-300 text-left">Descuento</td>
                            <td className="text-right border border-gray-300">{shop.discount}</td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <th className="border border-gray-300">TOTAL</th>
                            <th className="text-right p-2 border border-gray-300">{shop.total}</th>
                        </tr>
                    </tfoot>
                </TableResponsive>
            </div>
            <SubmitButton />
        </div>
    )
}
