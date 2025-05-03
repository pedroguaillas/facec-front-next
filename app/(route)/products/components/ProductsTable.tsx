"use client";

import { useProducts } from '../context/ProductContext';
import { PrimaryButton, TableResponsive } from '@/components'

export const ProductsTable = () => {

    const { products } = useProducts();

    return (
        <TableResponsive>
            <thead>
                <tr>
                    <th>CODIGO</th>
                    <th className='text-left'>PRODUCTO/SERVICIO</th>
                    <th className="text-right">PRECIO</th>
                    <th className="text-right">IVA</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {products.map((product, index) => (
                    <tr key={product.id}
                        className={index % 2 === 0 ? 'bg-gray-200 dark:bg-gray-900 rounded' : ''}
                    >
                        <td>{product.atts.code}</td>
                        <td className='text-left'>{product.atts.name}</td>
                        <td className="text-right">${product.atts.price1.toFixed(2)}</td>
                        <td className="text-right">{product.atts.iva}%</td>
                        <td className='w-1'>
                            <PrimaryButton type='link' label='' action='edit' url={`products/${product.id.toString()}`} />
                        </td>
                    </tr>
                ))}
            </tbody>
        </TableResponsive>
    )
}
