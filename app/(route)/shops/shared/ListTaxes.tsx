"use client";

import { useFormShop } from '../context/FormShopContext';
import { useShopVoucherType } from '../hooks/useShopVoucherType';
import { useTaxes } from '../hooks/useTaxes';
import { ItemTax } from './ItemTax';
import { AddRowButton, tableHead } from '../../orders/shared/FormSection';

export const ListTaxes = () => {

    const { applieWithholding, taxes, errorTaxes } = useFormShop();
    const { addItem } = useTaxes();
    const { isNotaVenta } = useShopVoucherType();

    if (!applieWithholding) return null;

    const retained = taxes.reduce((acc, tax) => acc + (Number(tax.value) || 0), 0);

    return (
        <div className="mt-3">
            <div className="w-full overflow-x-auto">
                <table className='w-full min-w-[560px] table-fixed text-sm'>
                    <thead>
                        <tr className={tableHead}>
                            <th className='w-32 text-left'>Impuesto</th>
                            <th className='text-left'>Concepto</th>
                            <th className='w-20 text-right'>%</th>
                            <th className='w-28 text-right'>Base</th>
                            <th className='w-24 text-right'>Retenido</th>
                            <th className='w-11'><span className='sr-only'>Acciones</span></th>
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
                        <tr className="[&>td]:px-1.5 [&>td]:pt-3 text-sm">
                            <td colSpan={4} className='text-right text-ink-3'>Total retenido</td>
                            <td className='text-right font-semibold tabular-nums text-ink-1'>{retained.toFixed(2)}</td>
                            <td />
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Nota de Venta solo admite la retención de renta 332, ya autorellenada */}
            {!isNotaVenta && <AddRowButton label="Agregar retención" onClick={addItem} />}
        </div>
    )
}
