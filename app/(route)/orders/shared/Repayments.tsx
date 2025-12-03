"use client";

import { PrimaryButton, Separate } from "@/components";
import { useFormInvoice } from "../context/FormInvoiceContext"
import { ItemRepayment } from "./ItemRepayment";
import { useRepayments } from "../hooks/useRepayments";

export const Repayments = () => {

    const { repayment, repayments, errorRepayments } = useFormInvoice();
    const { addItemRepayment, updateItemRepayment, deleteItemRepayment } = useRepayments();

    if (!repayment) {
        return null;
    }

    return (
        <>
            <h2 className="font-bold py-2">Rembolsos</h2>

            {/* Table responsive */}
            <div className="w-full overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="[&>th]:p-1 [&>th]:border [&>th]:border-gray-300 [&>th]:py-2 [&>th]:dark:border-gray-500">
                            <th>RUC</th>
                            <th>Secuencial</th>
                            <th>Fecha</th>
                            <th>Autorización</th>
                            <th>Subtotal - IVA - Total</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {repayments.map((item, index) => (
                            <ItemRepayment
                                key={item.id}
                                index={index}
                                repayment={item}
                                error={errorRepayments[item.id]}
                                updateItemRepayment={updateItemRepayment}
                                deleteItemRepayment={deleteItemRepayment}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end mt-2">
                <div className="w-28">
                    <PrimaryButton onClick={addItemRepayment} label="Añadir" action="add" type="button" />
                </div>
            </div>

            <Separate />
        </>
    )
}
