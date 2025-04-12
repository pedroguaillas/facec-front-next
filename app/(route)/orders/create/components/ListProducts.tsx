"use client";

import { PrimaryButton } from "@/components";
import { ItemProduct } from "./ItemProduct";
import { useProductOutput } from "../hooks/useProductOutput";
import { useState } from "react";

export const ListProducts = () => {
    const { productOutputs, addItem, updateItem, selectProduct, breakdown, removeItem } = useProductOutput();
    const [isChecked, setIsChecked] = useState(false);

    const handleChange = () => {
        setIsChecked(!isChecked);
        breakdown(!isChecked);
    };

    return (
        <div className="">
            <div className="flex gap-16 my-4">
                <span className="font-bold">Productos</span>
                <label className=" inline-flex gap-2">
                    <input type="checkbox" checked={isChecked} onChange={handleChange} />
                    Desglose
                </label>
            </div>
            <table className="w-full">
                <thead>
                    <tr className="[&>th]:border [&>th]:border-gray-300 [&>th]:dark:border-gray-500">
                        <th className="w-20 sm:w-24">Cant</th>
                        <th>Producto/Servicio</th>
                        <th className="w-20 sm:w-24">Precio</th>
                        <th className="w-20 sm:w-24">Descuento</th>
                        {/* <th className="w-24">IVA</th> */}
                        <th className="w-20 sm:w-24">Subtotal</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {productOutputs.map((op, index) => (
                        <ItemProduct key={op.id} index={index} productOutput={op} updateItem={updateItem} selectProduct={selectProduct} removeItem={removeItem} />
                    ))}
                </tbody>
            </table>

            <div className="flex justify-end mt-2">
                <div className="w-28">
                    <PrimaryButton onClick={addItem} label="Agregar" action="create" type="button" />
                </div>
            </div>
        </div>
    )
}
