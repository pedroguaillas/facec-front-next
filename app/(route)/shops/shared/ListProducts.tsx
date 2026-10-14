"use client";

import { useListProducts } from "../hooks/useListProducts";
import { useFormShop } from "../context/FormShopContext";
import { useShopVoucherType } from "../hooks/useShopVoucherType";
import { ItemProduct } from "./ItemProduct";
import { SortableItems } from "../../orders/shared/SortableItems";
import { AddRowButton, FormSection, tableHead } from "../../orders/shared/FormSection";

// Solo la liquidación de compra detalla productos (la emite la empresa)
export const ListProducts = () => {

    const { addItem, updateItem, selectProduct, deleteItem, moveItem } = useListProducts();
    const { productOutputs } = useFormShop();
    const { isLiquidacion } = useShopVoucherType();

    if (!isLiquidacion) {
        return null;
    }

    const ids = productOutputs.map(op => op.id);
    const sortable = productOutputs.length > 1;

    return (
        <FormSection title="Productos / Servicios">
            <div className="w-full overflow-x-auto">
                <SortableItems ids={ids} onMove={moveItem}>
                    <table className="w-full min-w-[480px] table-fixed text-sm">
                        <thead>
                            <tr className={tableHead}>
                                <th className="w-9"><span className="sr-only">Orden</span></th>
                                <th className="text-left">Producto / Servicio</th>
                                <th className="w-20 lg:w-24 text-right">Cant.</th>
                                <th className="w-24 lg:w-28 text-right">Precio</th>
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
