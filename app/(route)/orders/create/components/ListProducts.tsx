"use client";

import { useCreateInvoice } from "../../context/InvoiceCreateContext";
import { useProductOutput } from "../hooks/useProductOutput";
import { PrimaryButton } from "@/components";
import { ItemProduct } from "./ItemProduct";

export const ListProducts = () => {

    const { productOutputs, addItem, updateItem, selectProduct, breakdown, removeItem } = useProductOutput();
    const isEnabledIce = productOutputs.filter(p => p.ice !== undefined).length > 0;
    const { errorProductOutputs, isTaxBreakdown, setIsTaxBreakdown } = useCreateInvoice();

    const handleChange = () => {
        setIsTaxBreakdown(!isTaxBreakdown);
        breakdown(!isTaxBreakdown);
    };

    return (
        <>
            <div className="flex gap-16 my-4">
                <span className="font-bold">Productos</span>
                <label className=" inline-flex gap-2">
                    <input type="checkbox" checked={isTaxBreakdown} onChange={handleChange} />
                    Desglose
                </label>
            </div>
            <table className="w-full">
                <thead>
                    <tr className="[&>th]:border [&>th]:border-gray-300 [&>th]:py-2 [&>th]:dark:border-gray-500">
                        <th className="w-20 sm:w-24">Cant</th>
                        <th>Producto/Servicio</th>
                        <th className="w-20 sm:w-24">Precio</th>
                        <th className="w-20 sm:w-24">Descuento</th>
                        {isTaxBreakdown ? <th className="w-24">IVA</th> : null}
                        <th className="w-20 sm:w-24">Subtotal</th>
                        {isEnabledIce ? <th className="w-20 sm:w-24">ICE</th> : null}
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

            <div className="flex justify-end mt-2">
                <div className="w-34">
                    <PrimaryButton onClick={addItem} label="Añadir producto" action="create" type="button" />
                </div>
            </div>
        </>
    )
}
