"use client";

import { useListProducts } from "../hooks/useListProducts";
import { useFormShop } from "../context/FormShopContext";
import { useShopVoucherType } from "../hooks/useShopVoucherType";
import { ItemProduct } from "./ItemProduct";
import { SortableItems } from "../../orders/shared/SortableItems";
import { AddRowButton, FormSection, tableHead } from "../../orders/shared/FormSection";
import { Notice } from "@/components";

// La liquidación de compra detalla productos (la emite la empresa). Con inventario, la factura y
// la nota de venta también, para ingresar el stock al kardex (las bases siguen copiándose a mano)
export const ListProducts = () => {

    const { addItem, updateItem, selectProduct, deleteItem, moveItem, updateUnit, addUnitLine, toggleRemember, unlockXml } = useListProducts();
    const { productOutputs, errorShop, xmlImported } = useFormShop();
    const { withProducts, isInventoryEntry } = useShopVoucherType();

    if (!withProducts) {
        return null;
    }

    const ids = productOutputs.map(op => op.id);
    const sortable = productOutputs.length > 1;
    const pending = productOutputs.filter(item => item.xml && !item.product_id).length;

    return (
        <FormSection title={isInventoryEntry ? "Productos que ingresan al inventario" : "Productos / Servicios"}>
            {xmlImported ? (
                <div className="mb-3">
                    <Notice
                        tone={pending > 0 ? 'warning' : 'info'}
                        title={pending > 0 ? `${pending} ${pending === 1 ? 'producto' : 'productos'} del XML por vincular` : 'Productos cargados del XML'}
                        action={<button type="button" onClick={unlockXml} className="text-sm font-medium text-primary hover:underline cursor-pointer whitespace-nowrap">Editar manualmente</button>}
                    >
                        Cantidades y costos (con ICE, sin IVA) van tal como vienen en el XML. Busca tu producto o servicio en cada línea por vincular.
                    </Notice>
                </div>
            ) : isInventoryEntry && (
                <p className="mb-2 text-xs text-ink-3">
                    Opcional. Detalla los productos del comprobante con su costo unitario sin IVA para sumarlos al stock.
                    Las bases del resumen se calculan con estas líneas; ajústalas si el comprobante trae otros valores.
                </p>
            )}
            <div className="w-full overflow-x-auto">
                <SortableItems ids={ids} onMove={moveItem}>
                    <table className="w-full md:min-w-[480px] table-fixed text-sm max-md:block">
                        <thead className="max-md:hidden">
                            <tr className={tableHead}>
                                <th className="w-9"><span className="sr-only">Orden</span></th>
                                <th className="text-left">{isInventoryEntry ? 'Producto' : 'Producto / Servicio'}</th>
                                <th className="w-20 lg:w-24 text-right">Cant.</th>
                                <th className="w-24 lg:w-28 text-right">{isInventoryEntry ? 'Costo unit.' : 'Precio'}</th>
                                <th className="w-24 lg:w-28 text-right">Subtotal</th>
                                <th className="w-11"><span className="sr-only">Acciones</span></th>
                            </tr>
                        </thead>
                        <tbody className="max-md:block">
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
                                    updateUnit={updateUnit}
                                    addUnitLine={addUnitLine}
                                    errors={errorShop as Record<string, string>}
                                    toggleRemember={toggleRemember}
                                />
                            ))}
                        </tbody>
                    </table>
                </SortableItems>
            </div>

            {!xmlImported && <AddRowButton label="Agregar producto" onClick={addItem} />}
        </FormSection>
    )
};
