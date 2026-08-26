"use client";

import { useProductOutput } from "../hooks/useProductOutput";
import { useFormInvoice } from "../context/FormInvoiceContext";
import { PrimaryButton } from "@/components";
import { ItemProduct } from "./ItemProduct";
import { ImportItems } from "./ImportItems";
import { useSession } from "next-auth/react";

export const ListProducts = () => {

    const { productOutputs, addItem, updateItem, selectProduct, breakdown, removeItem } = useProductOutput();
    const { errorProductOutputs, isTaxBreakdown, isActiveIce, setIsTaxBreakdown } = useFormInvoice();
    const { data: session } = useSession();

    const handleChange = () => {
        setIsTaxBreakdown(!isTaxBreakdown);
        breakdown(!isTaxBreakdown);
    };

    return (
        <>
            <div className="flex gap-16 my-4">
                <span className="font-bold">Productos/Servicios</span>
                <label className=" inline-flex gap-2">
                    <input type="checkbox" checked={isTaxBreakdown} onChange={handleChange} />
                    Desglose
                </label>

                {session?.user.permissions.import_in_invoice && (
                    <ImportItems />
                )}
            </div>

            {/* Table responsive */}
            <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[360px]">
                    <thead>
                        <tr className="[&>th]:border [&>th]:border-gray-300 [&>th]:py-2 [&>th]:whitespace-nowrap [&>th]:dark:border-gray-500">
                            <th className="min-w-20 sm:min-w-24">Cant</th>
                            <th>Producto/Servicio</th>
                            <th className="min-w-20 sm:min-w-24">Precio</th>
                            <th className="min-w-20 sm:min-w-24">Descuento</th>
                            {isTaxBreakdown ? <th className="min-w-24">IVA</th> : null}
                            <th className="min-w-20 sm:min-w-24">Subtotal</th>
                            {isActiveIce ? <th className="min-w-20 sm:min-w-24">ICE</th> : null}
                            <th></th>
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
