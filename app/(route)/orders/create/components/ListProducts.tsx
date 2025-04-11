"use client";

import { PrimaryButton, TableResponsive } from "@/components";
import { ItemProduct } from "./ItemProduct";
import { useCreateInvoice } from "../../context/InvoiceCreateContext";
import { initialProductItem } from "@/app/(route)/constants/initialValues";

export const ListProducts = () => {
    const { productOutputs, setProductOutputs, setInvoice } = useCreateInvoice();

    const createNewProductItem = (): ProductOutput => ({
        ...initialProductItem,
        id: crypto.randomUUID(),
    });

    // Agregar producto a la lista
    const addItem = () => {
        setProductOutputs((prev) => ([...prev, { ...createNewProductItem() }]));
    };

    // Modificar cantidad o precio de un producto
    const updateItem = (index: number, field: "quantity" | "price" | "discount" | "total_iva" | "ice", value: string | number) => {
        if (value && Number(value) < 0) return
        const prods = productOutputs;
        prods[index][field] = value;
        let { price, quantity, discount } = prods[index]
        const { percentage } = prods[index]
        price = price === '' ? 0 : Number(price);
        quantity = quantity === '' ? 0 : Number(quantity);
        discount = discount === '' ? 0 : Number(discount);
        if (field === 'total_iva') {
            prods[index].price = parseFloat((Number(value) / quantity / (1 + (percentage / 100))).toFixed(6))
        } else if (field !== 'ice') {
            prods[index].total_iva = price * quantity - discount
        }
        recalculate(prods);
        // setProductOutputs((prev) => prev.map((item) =>
        //     item.id === id ? { ...item, [field]: value } : item
        // ));
    };

    //Method caculate totals & modify state all.
    const recalculate = (productOutpus: ProductOutput[]) => {
        let no_iva = 0;
        let base0 = 0;
        let base5 = 0;
        let base8 = 0;
        let base12 = 0;
        let base15 = 0;
        let totalDiscount = 0;
        let totalIce = 0;

        productOutpus.forEach(({ quantity, price, discount, iva, total_iva, ice }) => {
            totalIce += ice !== undefined ? Number(ice) : 0
            totalDiscount += discount !== '' ? Number(discount) : 0
            if (iva !== undefined) {
                // IVA = 0% el total_iva = price * quantity - discount + 0 (0% IVA)
                no_iva += iva === 6 ? Number(total_iva) : 0;
                base0 += iva === 0 ? Number(total_iva) : 0;
                // IVA > 0% entonces total_iva = price * quantity - discount + Valor del IVA (5%-8%-12%-15%)
                base5 += iva === 5 ? Number(price) * Number(quantity) - Number(discount) : 0;
                base8 += iva === 8 ? Number(price) * Number(quantity) - Number(discount) : 0;
                base12 += iva === 2 ? Number(price) * Number(quantity) - Number(discount) : 0;
                base15 += iva === 4 ? Number(price) * Number(quantity) - Number(discount) : 0;
            }
        });

        const sub_total = no_iva + base0 + base5 + base8 + base12 + base15;

        const iva5 = Number((base5 * 0.05).toFixed(2));
        const iva8 = Number((base8 * 0.08).toFixed(2));
        const iva = base12 > 0 ? Number(((base12 + Number(totalIce)) * 0.12).toFixed(2)) : 0;
        const iva15 = base15 > 0 ? Number(((base15 + Number(totalIce)) * 0.15).toFixed(2)) : 0;
        const totalIva = Number((iva5 + iva8 + iva + iva15).toFixed(2));

        const total = sub_total + Number(totalIce) + totalIva;

        setProductOutputs(productOutpus);
        setInvoice(prevState => ({
            ...prevState, no_iva,
            base0,
            base5,
            base8,
            base12,
            base15,
            sub_total,
            ice: totalIce,
            discount: totalDiscount,
            iva5,
            iva8,
            iva,
            iva15,
            total
        }));
    };

    // Eliminar producto
    const removeItem = (index: number) => {
        setProductOutputs((prev) => (
            prev.filter((_, indexProduct) => indexProduct !== index)
        ));
    };

    return (
        <>
            <TableResponsive>
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
                        <ItemProduct key={op.id} index={index} productOutput={op} updateItem={updateItem} removeItem={removeItem} />
                    ))}
                </tbody>
            </TableResponsive>

            <div className="flex justify-end mt-2">
                <div className="w-28">
                    <PrimaryButton onClick={addItem} label="Agregar" action="create" type="button" />
                </div>
            </div>
        </>
    )
}
