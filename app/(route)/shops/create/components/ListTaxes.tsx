"use client";

import { useCreateShop } from '../context/ShopCreateContext'
import { ItemTax } from './ItemTax';

export const ListTaxes = () => {

    const { taxes } = useCreateShop();

    return (
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
                    <ItemTax key={tax.id} index={index} tax={tax} />
                ))}
            </tbody>
            <tfoot>
                <tr className="[&>th]:border [&>th]:border-gray-300 [&>th]:py-2 [&>th]:dark:border-gray-500">
                    <th colSpan={4}>Total retenido</th>
                    <th className='p-1 text-right'>0.00</th>
                    <th></th>
                </tr>
            </tfoot>
        </table>
    )
}
