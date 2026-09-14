"use client";

import { useProductOutput } from "../hooks/useProductOutput";
import { useFormInvoice } from "../context/FormInvoiceContext";
import { PrimaryButton } from "@/components";
import { ItemProduct } from "./ItemProduct";
import { ItemProductCard } from "./ItemProductCard";
import { ImportItems } from "./ImportItems";
import { useSession } from "next-auth/react";

export const ListProducts = () => {

    const { productOutputs, addItem, updateItem, selectProduct, removeItem } = useProductOutput();
    const { errorProductOutputs, isActiveIce } = useFormInvoice();
    const { data: session } = useSession();

    return (
        <>
            <div className="flex gap-16 my-4">
                <span className="font-bold">Productos/Servicios</span>

                {session?.user.permissions.import_in_invoice && (
                    <ImportItems />
                )}
            </div>

            {/* Cards - mobile only */}
            <div className="flex flex-col gap-2 md:hidden">
                {productOutputs.map((op, index) => (
                    <ItemProductCard
                        key={op.id}
                        index={index}
                        productOutput={op}
                        error={errorProductOutputs[op.id]} // 🔴 pasamos errores por ID
                        updateItem={updateItem}
                        selectProduct={selectProduct}
                        removeItem={removeItem}
                    />
                ))}
            </div>

            {/* Table responsive - desktop only */}
            <div className="hidden md:block w-full overflow-x-auto">
                <table className="w-full min-w-[360px] table-fixed">
                    <thead>
                        <tr className="[&>th]:border [&>th]:border-gray-300 [&>th]:py-2 [&>th]:whitespace-nowrap [&>th]:dark:border-gray-500">
                            <th>Producto/Servicio</th>
                            <th className="w-16 lg:w-32">Cant.</th>
                            <th className="w-24 lg:w-32">Precio</th>
                            <th className="w-24 lg:w-24">Des.</th>
                            <th className="w-24 lg:w-32">Subtotal</th>
                            <th className="w-16 lg:w-24">IVA</th>
                            <th className="w-24 lg:w-32">Total</th>
                            {isActiveIce ? <th className="w-32">ICE</th> : null}
                            <th className="w-10"></th>
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
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end mt-2">
                <div className="w-28">
                    <PrimaryButton onClick={addItem} label="Añadir" action="add" type="button" />
                </div>
            </div>
        </>
    )
}
