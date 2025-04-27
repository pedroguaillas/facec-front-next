"use client";

import { TableResponsive } from '@/components'
import { useCreateShop } from '../context/ShopCreateContext'
import { ItemTax } from './ItemTax';

export const ListTaxes = () => {

    const { taxes } = useCreateShop();
    return (
        <TableResponsive>
            <thead>
                <tr>
                    <th>Impuesto</th>
                    <th>Retención</th>
                    <th>Porcentaje</th>
                    <th>Base Imp</th>
                    <th>Valor</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {taxes.map((tax) => (
                    <ItemTax key={tax.code} tax={tax} />
                ))}
            </tbody>
        </TableResponsive>
    )
}
