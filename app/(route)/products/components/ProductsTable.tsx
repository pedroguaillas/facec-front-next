"use client";

import { useProducts } from "../context/ProductContext";
import { Dialog, IconButton, TableResponsive } from "@/components";
import { axiosAuth } from "@/lib/axios";
import { deleteProduct } from "../services/productServices";
import { useInventory } from "@/lib/hooks/useInventory";

export const ProductsTable = () => {
    const { products, productDeleteId, fetchProducts, setProductDeleteId } = useProducts();
    const { enabled: inventory } = useInventory();

    const confirmation = (accept: boolean) => {
        if (accept) {
            deleteProduct(productDeleteId ?? 0, axiosAuth).then(() => {
                setProductDeleteId(null);
                fetchProducts();
            });
        }
    };

    return (
        <>
            <TableResponsive>
                <thead>
                    <tr>
                        <th>CODIGO</th>
                        <th className="text-left">PRODUCTO/SERVICIO</th>
                        <th className="text-right">PRECIO</th>
                        <th className="text-right">IVA</th>
                        {inventory && <th className="text-right">STOCK</th>}
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => (
                        <tr key={product.id}>
                            <td>{product.atts.code}</td>
                            <td className="text-left">{product.atts.name}</td>
                            <td className="text-right">${product.atts.price1.toFixed(2)}</td>
                            <td className="text-right">{product.atts.iva}%</td>
                            {inventory && (
                                <td className={`text-right tabular-nums ${Number(product.atts.stock) < 0 ? 'text-sri-fail' : ''}`}>
                                    {product.atts.type_product === 1 && product.atts.stock !== null
                                        ? Number(product.atts.stock).toLocaleString('es-EC', { maximumFractionDigits: 6 })
                                        : '—'}
                                </td>
                            )}
                            <td className="w-1">
                                <div className="flex gap-2">
                                    <IconButton
                                        type="link"
                                        action="edit"
                                        url={`/products/${product.id.toString()}`}
                                        title="Editar"
                                    />
                                    {inventory && product.atts.type_product === 1 && (
                                        <IconButton type="link" action="view" url={`/inventory/kardex/${product.id}`} title="Kardex" />
                                    )}
                                    <IconButton
                                        type="button"
                                        action="delete"
                                        onClick={() => setProductDeleteId(product.id)}
                                        title="Eliminar"
                                    />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </TableResponsive>
            <Dialog
                itemId={productDeleteId}
                confirmation={confirmation}
                title="¿Estás seguro de querer eliminar este producto?"
                sutTitle="Esta acción no se puede deshacer y eliminará el producto de forma permanente."
            />
        </>
    );
};
