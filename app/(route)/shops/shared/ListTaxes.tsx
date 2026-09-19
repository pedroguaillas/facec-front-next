"use client";

import { useFormShop } from '../context/FormShopContext';
import { useShopVoucherType } from '../hooks/useShopVoucherType';
import { PrimaryButton } from '@/components';
import { useTaxes } from '../hooks/useTaxes';
import { ItemTax } from './ItemTax';

export const ListTaxes = () => {

    const { applieWithholding, taxes, errorTaxes } = useFormShop();
    const { addItem } = useTaxes();
    const { isNotaVenta } = useShopVoucherType();

    if (!applieWithholding) return null;

    return (
        <>
            {/* Table responsive */}
            <div className="w-full overflow-x-auto">
                <table className='w-full'>
                    <thead>
                        <tr className="[&>th]:border [&>th]:border-gray-300 [&>th]:py-2 [&>th]:dark:border-gray-500">
                            <th>Impuesto</th>
                            <th>Retención</th>
                            <th>Porcentaje</th>
                            <th>Base Imp</th>
                            <th>Valor</th>
                            <th className='w-10'></th>
                        </tr>
                    </thead>
                    <tbody>
                        {taxes.map((tax, index) => (
                            <ItemTax
                                key={tax.id}
                                index={index}
                                tax={tax}
                                error={errorTaxes[tax.id]}
                            />
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="[&>th]:border [&>th]:border-gray-300 [&>th]:py-2 [&>th]:dark:border-gray-500">
                            <th colSpan={4}>Total retenido</th>
                            <th className='p-1 text-right'>
                                {taxes.reduce((acc, tax) => acc + (Number(tax.value) || 0), 0).toFixed(2)}
                            </th>
                            <th></th>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Nota de Venta solo admite la retención de renta 332, ya autorellenada */}
            {!isNotaVenta && (
                <div className="flex justify-end mt-2">
                    <div className="w-28">
                        <PrimaryButton onClick={addItem} label="Añadir" action="add" type="button" />
                    </div>
                </div>
            )}
        </>
    )
}
