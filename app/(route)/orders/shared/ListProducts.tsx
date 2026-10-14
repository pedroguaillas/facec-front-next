"use client";

import { useProductOutput } from "../hooks/useProductOutput";
import { useFormInvoice } from "../context/FormInvoiceContext";
import { ItemProduct } from "./ItemProduct";
import { ItemProductCard } from "./ItemProductCard";
import { ImportItems } from "./ImportItems";
import { AddRowButton, FormSection, tableHead } from "./FormSection";
import { useSession } from "next-auth/react";
import { SortableItems } from "./SortableItems";
import { ReactNode } from "react";
import { ProductOutput } from "@/types";

interface Props {
    // Contenido extra bajo el producto de cada línea (ej. código/descripción propios en la recurrente)
    renderLineExtra?: (item: ProductOutput, index: number) => ReactNode;
}

export const ListProducts = ({ renderLineExtra }: Props = {}) => {

    const { productOutputs, addItem, updateItem, selectProduct, removeItem, moveItem } = useProductOutput();
    const { errorProductOutputs, isActiveIce } = useFormInvoice();
    const { data: session } = useSession();
    const ids = productOutputs.map(op => op.id);
    // Con una sola línea no hay nada que ordenar
    const sortable = productOutputs.length > 1;

    return (
        <FormSection
            title="Productos / Servicios"
            // Importar CSV solo en computadora (pantalla grande)
            aside={session?.user.permissions.import_in_invoice ? <div className="hidden lg:block"><ImportItems /></div> : undefined}
        >
            {/* Cards - mobile only */}
            <div className="flex flex-col gap-2 md:hidden">
                <SortableItems ids={ids} onMove={moveItem}>
                {productOutputs.map((op, index) => (
                    <ItemProductCard
                        key={op.id}
                        index={index}
                        productOutput={op}
                        error={errorProductOutputs[op.id]} // 🔴 pasamos errores por ID
                        updateItem={updateItem}
                        selectProduct={selectProduct}
                        removeItem={removeItem}
                        sortable={sortable}
                        extra={renderLineExtra?.(op, index)}
                    />
                ))}
                </SortableItems>
            </div>

            {/* Table responsive - desktop only */}
            <div className="hidden md:block w-full overflow-x-auto">
                <SortableItems ids={ids} onMove={moveItem}>
                <table className="w-full min-w-[360px] table-fixed text-sm">
                    <thead>
                        <tr className={tableHead}>
                            <th className="w-9"><span className="sr-only">Orden</span></th>
                            <th className="text-left">Producto / Servicio</th>
                            <th className="w-16 lg:w-24 text-right">Cant.</th>
                            <th className="w-24 lg:w-28 text-right">Precio</th>
                            <th className="w-20 lg:w-24 text-right">Desc.</th>
                            <th className="w-20 lg:w-24 text-right">Subtotal</th>
                            <th className="w-16 lg:w-20 text-right">IVA</th>
                            <th className="w-24 lg:w-28 text-right">Total</th>
                            {isActiveIce ? <th className="w-28 text-right">ICE</th> : null}
                            <th className="w-11"><span className="sr-only">Acciones</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {productOutputs.map((op, index) => (
                            <ItemProduct
                                key={op.id}
                                index={index}
                                productOutput={op}
                                error={errorProductOutputs[op.id]} // 🔴 pasamos errores por ID
                                updateItem={updateItem}
                                selectProduct={selectProduct}
                                removeItem={removeItem}
                                sortable={sortable}
                                extra={renderLineExtra?.(op, index)}
                            />
                        ))}
                    </tbody>
                </table>
                </SortableItems>
            </div>

            <AddRowButton label="Agregar producto" onClick={addItem} />
        </FormSection>
    )
}
