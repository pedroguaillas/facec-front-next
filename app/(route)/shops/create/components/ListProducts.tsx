"use client";

import { useCreateShop } from "../context/ShopCreateContext";
import { useListProducts } from "../hooks/useListProducts";
import { PrimaryButton, Separate } from "@/components";
import { ItemProduct } from "./ItemProduct";
import { VoucherType } from "@/constants";

export const ListProducts = () => {

    const { addItem, updateItem, selectProduct, deleteItem } = useListProducts();
    const { shop, productOutputs } = useCreateShop();

    if (Number(shop.voucher_type) !== VoucherType.LIQUIDATION) {
        return null;
    }

    return (
        <>
            <Separate />

            <div className="flex gap-16 my-4">
                <span className="font-bold">Productos/Servicios</span>
            </div>

            <div className="w-full overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr
                            className="[&>th]:border [&>th]:border-gray-300 [&>th]:dark:border-gray-600 [&>th]:p-1"
                        >
                            <th>Cantidad</th>
                            <th>Producto/Servicio</th>
                            <th>Precio</th>
                            <th>SubTotal</th>
                            <th></th>
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
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end mt-2">
                <div className="w-28">
                    <PrimaryButton label="Añadir" action="add" type="button" onClick={addItem} />
                </div>
            </div>
        </>
    )
};