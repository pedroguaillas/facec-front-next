"use client";

import { useFormInvoice } from "../context/FormInvoiceContext"
import { ItemRepayment } from "./ItemRepayment";
import { useRepayments } from "../hooks/useRepayments";
import { AddRowButton, FormSection, tableHead } from "./FormSection";

export const Repayments = () => {

    const { repayment, repayments, errorRepayments } = useFormInvoice();
    const { addItemRepayment, updateItemRepayment, deleteItemRepayment } = useRepayments();

    if (!repayment) {
        return null;
    }

    return (
        <FormSection title="Reembolsos">
            {/* Table responsive */}
            <div className="w-full overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className={`${tableHead} [&>th]:text-left`}>
                            <th>RUC</th>
                            <th>Secuencial</th>
                            <th>Fecha</th>
                            <th>Autorización</th>
                            <th>Subtotal - IVA - Total</th>
                            <th className="w-11"><span className="sr-only">Acciones</span></th>
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

            <AddRowButton label="Agregar reembolso" onClick={addItemRepayment} />
        </FormSection>
    )
}
