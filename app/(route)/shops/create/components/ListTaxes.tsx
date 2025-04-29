"use client";

import { PrimaryButton } from '@/components';
import { useCreateShop } from '../context/ShopCreateContext'
import { ItemTax } from './ItemTax';
import { useTaxes } from '../hooks/useTaxes';

export const ListTaxes = () => {

    const { taxes, errorTaxes } = useCreateShop();
    const { addItem } = useTaxes();

    return (
        <>
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

            <div className="flex justify-end mt-2">
                <div className="w-34">
                    <PrimaryButton onClick={addItem} label="Añadir retención" action="create" type="button" />
                </div>
            </div>
        </>
    )
}
