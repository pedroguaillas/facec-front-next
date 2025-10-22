"use client";

import { Dialog } from '@/components/dialog/Dialog';
import { useProducts } from '../context/ProductContext';
import { PrimaryButton, TableResponsive } from '@/components'
import { useState } from 'react';
import { axiosAuth } from '@/lib/axios';
import { deleteProduct } from '../services/productServices';

export const ProductsTable = () => {

    const { products } = useProducts();
    const [productDeleteId, setProductDeleteId] = useState<number | null>(null);

    const confirmation = (accept: boolean) => {
        if (accept) {
            deleteProduct(productDeleteId ?? 0, axiosAuth);
        }
        setProductDeleteId(null);
    }

    return (
        <>
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
                                <div className='flex gap-2'>
                                    <PrimaryButton type='link' label='' action='edit' url={`products/${product.id.toString()}`} />
                                    <PrimaryButton type='button' label='' action='delete' onClick={() => setProductDeleteId(product.id)} />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </TableResponsive>
            <Dialog
                itemId={productDeleteId}
                confirmation={confirmation}
                title='¿Estás seguro de querer eliminar este producto?'
                sutTitle='Esta acción no se puede deshacer y eliminará el producto de forma
                    permanente.'
            />
        </>
    )
}
