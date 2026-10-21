"use client";

import { useListProducts } from "../hooks/useListProducts";
import { useFormShop } from "../context/FormShopContext";
import { useShopVoucherType } from "../hooks/useShopVoucherType";
import { ItemProduct } from "./ItemProduct";
import { SortableItems } from "../../orders/shared/SortableItems";
import { AddRowButton, FormSection, tableHead } from "../../orders/shared/FormSection";

// La liquidación de compra detalla productos (la emite la empresa). Con inventario, la factura y
// la nota de venta también, para ingresar el stock al kardex (las bases siguen copiándose a mano)
export const ListProducts = () => {

    const { addItem, updateItem, selectProduct, deleteItem, moveItem } = useListProducts();
    const { productOutputs } = useFormShop();
    const { withProducts, isInventoryEntry } = useShopVoucherType();

    if (!withProducts) {
        return null;
    }

    const ids = productOutputs.map(op => op.id);
    const sortable = productOutputs.length > 1;

    return (
        <FormSection title={isInventoryEntry ? "Productos que ingresan al inventario" : "Productos / Servicios"}>
            {isInventoryEntry && (
                <p className="mb-2 text-xs text-ink-3">
                    Opcional. Detalla los productos del comprobante con su costo unitario sin IVA para sumarlos al stock.
                    No cambia los totales: copia las bases del comprobante en el resumen.
                </p>
            )}
            <div className="w-full overflow-x-auto">
                <SortableItems ids={ids} onMove={moveItem}>
                    <table className="w-full min-w-[480px] table-fixed text-sm">
                        <thead>
                            <tr className={tableHead}>
                                <th className="w-9"><span className="sr-only">Orden</span></th>
                                <th className="text-left">{isInventoryEntry ? 'Producto' : 'Producto / Servicio'}</th>
                                <th className="w-20 lg:w-24 text-right">Cant.</th>
                                <th className="w-24 lg:w-28 text-right">{isInventoryEntry ? 'Costo unit.' : 'Precio'}</th>
                                <th className="w-24 lg:w-28 text-right">Subtotal</th>
                                <th className="w-11"><span className="sr-only">Acciones</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {productOutputs.map((productOutput, index) => (
                                <ItemProduct
                                    key={productOutput.id}
                                    index={index}
                                    productOutput={productOutput}
                                    updateItem={updateItem}
                                    selectProduct={selectProduct}
                                    deleteItem={deleteItem}
                                    sortable={sortable}
                                    onlyProducts={isInventoryEntry}
                                />
                            ))}
                        </tbody>
                    </table>
                </SortableItems>
            </div>

            <AddRowButton label="Agregar producto" onClick={addItem} />
        </FormSection>
    )
};
